// src/view_trip/[tripID]/index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../components/ui/Card";
import CardContent from "../../components/ui/CardContent";
import Button from "../../components/ui/button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

const ViewTripPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrip, setEditedTrip] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/trips/${tripId}`)
      .then((response) => setTrip(response.data))
      .catch((error) => console.error("Error fetching trip:", error));
  }, [tripId]);

  const handleEdit = () => {
    setEditedTrip(trip);
    setIsEditing(true);
  };

  const handleSave = () => {
    axios
      .put(`/api/trips/${tripId}`, editedTrip)
      .then((response) => {
        setTrip(response.data);
        setIsEditing(false);
      })
      .catch((error) => console.error("Error saving trip:", error));
  };

  const handleDelete = () => {
    axios
      .delete(`/api/trips/${tripId}`)
      .then(() => {
        setDeleteModal(false);
        navigate("/trips");
      })
      .catch((error) => console.error("Error deleting trip:", error));
  };

  const toggleCompleted = () => {
    const updatedTrip = { ...trip, status: trip.status === "Completed" ? "Planned" : "Completed" };
    axios
      .put(`/api/trips/${tripId}`, updatedTrip)
      .then((response) => setTrip(response.data))
      .catch((error) => console.error("Error updating status:", error));
  };

  if (!trip) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardContent>
          <h1 className="text-2xl font-bold mb-2">Trip Details</h1>
          <p><strong>Destination:</strong> {trip.destination}</p>
          <p><strong>Start Date:</strong> {new Date(trip.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> {new Date(trip.endDate).toLocaleDateString()}</p>
          <p><strong>Budget:</strong> ${trip.budget}</p>
          <p><strong>Description:</strong> {trip.description}</p>
          <p><strong>Status:</strong> {trip.status}</p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleEdit}>Edit</Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteModal(true)}>Delete</Button>
        <Button onClick={toggleCompleted}>
          {trip.status === "Completed" ? "Mark as Planned" : "Mark as Completed"}
        </Button>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <Modal onClose={() => setIsEditing(false)}>
          <Input
            label="Destination"
            value={editedTrip.destination}
            onChange={(e) => setEditedTrip({ ...editedTrip, destination: e.target.value })}
          />
          <Input
            label="Budget"
            type="number"
            value={editedTrip.budget}
            onChange={(e) => setEditedTrip({ ...editedTrip, budget: e.target.value })}
          />
          <Input
            label="Start Date"
            type="date"
            value={editedTrip.startDate}
            onChange={(e) => setEditedTrip({ ...editedTrip, startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={editedTrip.endDate}
            onChange={(e) => setEditedTrip({ ...editedTrip, endDate: e.target.value })}
          />
          <Input
            label="Description"
            multiline
            rows={4}
            value={editedTrip.description}
            onChange={(e) => setEditedTrip({ ...editedTrip, description: e.target.value })}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <Modal onClose={() => setDeleteModal(false)}>
          <h2>Are you sure you want to delete this trip?</h2>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleDelete}>Yes, Delete</Button>
            <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewTripPage;
