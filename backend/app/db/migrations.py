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


def ensure_user_profile_columns() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    missing_columns = [
        (name, definition)
        for name, definition in PROFILE_COLUMNS.items()
        if name not in existing_columns
    ]

    if not missing_columns:
        return

    with engine.begin() as connection:
        for name, definition in missing_columns:
            connection.execute(text(f"ALTER TABLE users ADD COLUMN {name} {definition}"))
