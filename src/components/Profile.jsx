import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfileByMobile } from "../services/profileApi";

const roleCopy = {
  admin: {
    title: "Admin Profile",
    subtitle: "Control center ownership, contact details, and team visibility.",
    specialtyLabel: "Department",
    specialtyPlaceholder: "Operations",
  },
  supplier: {
    title: "Supplier Profile",
    subtitle: "Keep supply details fresh so vendors know how to reach you.",
    specialtyLabel: "Supply Category",
    specialtyPlaceholder: "Fresh produce, packaging, dairy...",
  },
  vendor: {
    title: "Vendor Profile",
    subtitle: "Your storefront profile for orders, contact, and service status.",
    specialtyLabel: "Business Category",
    specialtyPlaceholder: "Street food, retail, catering...",
  },
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "UP";

const Profile = ({ role }) => {
  const { user, setUserProfile } = useAuth();
  const profile = user?.profile || {};
  const copy = roleCopy[role] || roleCopy.vendor;

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: profile.name || "",
    mobile: profile.mobile || user?.mobile || "",
    email: profile.email || "",
    location: profile.location || "",
    businessName: profile.businessName || "",
    businessType: profile.businessType || role,
    image: profile.image || "",
    about: profile.about || "",
    specialty: profile.specialty || "",
    availability: profile.availability || "Available",
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.mobile) {
        return;
      }

      try {
        setStatus("Loading profile from MongoDB...");
        const savedProfile = await getProfile({ mobile: user.mobile, role });

        if (!isMounted) {
          return;
        }

        setFormData((current) => ({ ...current, ...savedProfile }));
        setUserProfile(savedProfile);
        setStatus("");
      } catch (error) {
        if (isMounted) {
          setStatus(error.message);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [role, user?.mobile]);

  const completion = useMemo(() => {
    const requiredFields = [
      formData.name,
      formData.mobile,
      formData.email,
      formData.location,
      formData.businessName,
      formData.about,
    ];
    const filled = requiredFields.filter((value) => value.trim()).length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setStatus("Please fill name, mobile number, and email.");
      return;
    }

    try {
      setStatus("Saving profile to MongoDB...");
      const savedProfile = await updateProfileByMobile(formData.mobile, {
        ...formData,
        role,
      });
      setFormData((current) => ({ ...current, ...savedProfile }));
      setUserProfile(savedProfile);
      setIsEditing(false);
      setStatus("Profile updated in MongoDB.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {formData.image ? (
              <img src={formData.image} alt={formData.name || "Profile"} />
            ) : (
              <span>{getInitials(formData.name)}</span>
            )}
          </div>
          <span className="profile-role-badge">{role}</span>
        </div>

        <div className="profile-hero-copy">
          <p className="profile-kicker">{copy.title}</p>
          <h1>{formData.name || "Complete your profile"}</h1>
          <p>{copy.subtitle}</p>

          <div className="profile-actions">
            <button type="button" onClick={() => setIsEditing((value) => !value)}>
              {isEditing ? "View Profile" : "Edit Profile"}
            </button>
            <label className="upload-btn">
              Change Image
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        <div className="profile-score">
          <span>{completion}%</span>
          <p>Profile strength</p>
        </div>
      </section>

      {status && <p className="profile-status">{status}</p>}

      <div className="profile-grid">
        <section className="profile-panel">
          <div className="section-heading">
            <span>01</span>
            <h2>Profile Details</h2>
          </div>

          {isEditing ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <label>
                Full Name
                <input name="name" value={formData.name} onChange={handleChange} />
              </label>

              <label>
                Mobile Number
                <input name="mobile" value={formData.mobile} disabled />
              </label>

              <label>
                Mail ID
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </label>

              <label>
                Location
                <input name="location" value={formData.location} onChange={handleChange} />
              </label>

              <label>
                Business Name
                <input
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </label>

              <label>
                {copy.specialtyLabel}
                <input
                  name="specialty"
                  placeholder={copy.specialtyPlaceholder}
                  value={formData.specialty}
                  onChange={handleChange}
                />
              </label>

              <label>
                Availability
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Away">Away</option>
                </select>
              </label>

              <label className="full-width">
                About
                <textarea
                  name="about"
                  rows="4"
                  value={formData.about}
                  onChange={handleChange}
                />
              </label>

              <button type="submit" className="save-profile-btn">
                Save Profile
              </button>
            </form>
          ) : (
            <div className="profile-readonly">
              <div>
                <span>Name</span>
                <strong>{formData.name || "Not added"}</strong>
              </div>
              <div>
                <span>Mobile</span>
                <strong>{formData.mobile || "Not added"}</strong>
              </div>
              <div>
                <span>Mail ID</span>
                <strong>{formData.email || "Not added"}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{formData.location || "Not added"}</strong>
              </div>
              <div>
                <span>Business</span>
                <strong>{formData.businessName || "Not added"}</strong>
              </div>
              <div>
                <span>{copy.specialtyLabel}</span>
                <strong>{formData.specialty || "Not added"}</strong>
              </div>
            </div>
          )}
        </section>

        <aside className="profile-side">
          <div className="mini-panel">
            <span className="mini-label">Live Status</span>
            <strong>{formData.availability}</strong>
            <p>{formData.about || "Add a short bio to make this profile easier to trust."}</p>
          </div>

          <div className="mini-panel accent-panel">
            <span className="mini-label">Role</span>
            <strong>{role.toUpperCase()}</strong>
            <p>Profile changes are saved by mobile number and restored on the next login.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Profile;
