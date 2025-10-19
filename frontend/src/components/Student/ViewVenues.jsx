import { useEffect, useState } from "react";
import Loading from "../Loading";
import "./VenuesView.css";

const ViewVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/venues");
      const data = await res.json();
      if (data.success) {
        setVenues(data.venues);
      }
    } catch (err) {
      console.error("Error fetching venues:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="venues-wrapper">
      <h2 className="venues-title">Available Venues</h2>
      {loading ? (
        <Loading message="Fetching venues..." />
      ) : venues.length === 0 ? (
        <p className="no-venues">No venues found.</p>
      ) : (
        <div className="venues-grid">
          {venues.map((venue) => (
            <div key={venue.id} className="venue-card">
              {venue.image_url && (
                <img
                  src={venue.image_url}
                  alt={venue.venue_name}
                  className="venue-image"
                />
              )}
              <div className="venue-details">
                <h3 className="venue-name">{venue.venue_name}</h3>
                <p className="venue-description">{venue.venue_description}</p>
                <p><strong>Phone:</strong> {venue.phone_number || "N/A"}</p>
                <p><strong>Email:</strong> {venue.mail_id || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewVenues;