from sqlalchemy import inspect, text

from app.db.session import engine


PROFILE_COLUMNS = {
    "email": "VARCHAR(150) NULL",
    "specialty": "VARCHAR(150) NULL",
    "availability": "VARCHAR(30) NOT NULL DEFAULT 'Available'",
    "about": "VARCHAR(700) NULL",
    "profile_image": "LONGTEXT NULL",
    "updated_at": "DATETIME NULL",
}

PRODUCT_COLUMNS = {
    "description": "LONGTEXT NULL",
    "unit": "VARCHAR(80) NULL",
}


def ensure_columns(table_name: str, columns: dict[str, str]) -> None:
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
    missing_columns = [
        (name, definition)
        for name, definition in columns.items()
        if name not in existing_columns
    ]

    if not missing_columns:
        return

    with engine.begin() as connection:
        for name, definition in missing_columns:
            connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {name} {definition}"))


def ensure_user_profile_columns() -> None:
    ensure_columns("users", PROFILE_COLUMNS)


def ensure_product_columns() -> None:
    ensure_columns("products", PRODUCT_COLUMNS)
