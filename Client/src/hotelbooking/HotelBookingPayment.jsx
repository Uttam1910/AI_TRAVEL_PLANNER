import React, { useState, useEffect } from "react";

const HotelBookingPayment = () => {
  // State variables for hotels, booking, and payment
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [roomType, setRoomType] = useState("");
  const [availability, setAvailability] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
  });
  const [bookingResponse, setBookingResponse] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch hotels from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/hotels")
      .then((res) => res.json())
      .then((data) => setHotels(data))
      .catch((err) => console.error("Error fetching hotels:", err));
  }, []);

  // Handle changes for booking and payment forms
  const handleBookingFormChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handlePaymentFormChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  // Check room availability for the selected hotel and room type
  const checkAvailability = () => {
    if (!selectedHotel || !roomType) {
      setMessage("Please select both a hotel and a room type.");
      return;
    }
    fetch(
      `http://localhost:5000/api/hotels/${selectedHotel}/availability?roomType=${roomType}`
    )
      .then((res) => res.json())
      .then((data) => {
        setAvailability(data);
        setMessage("");
      })
      .catch((err) => {
        console.error("Error checking availability:", err);
        setMessage("Error checking availability. Please try again.");
      });
  };

  // Handle the hotel booking submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHotel || !roomType) {
      setMessage("Please select a hotel and a room type.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/bookings/hotel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: selectedHotel,
          roomType,
          ...bookingForm,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setBookingResponse(result.booking);
        setMessage("Booking confirmed! Please proceed to payment.");
      } else {
        setMessage(result.error || "Booking failed.");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      setMessage("Booking error. Please try again.");
    }
  };

  // Handle the dummy payment submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!bookingResponse || !bookingResponse.bookingId) {
      setMessage("No booking available for payment.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/payment/${bookingResponse.bookingId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentForm),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setPaymentResponse(result);
        setMessage("Payment successful!");
      } else {
        setMessage(result.error || "Payment failed.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setMessage("Payment error. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Hotel Booking & Payment
      </h1>

      {/* Booking Section */}
      <section className="bg-white shadow-lg rounded-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-700">
          Book a Hotel Room
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-1 text-gray-600">Select Hotel:</label>
            <select
              className="
                border
                rounded-md
                p-2
                w-full
                bg-white
                text-gray-700
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
            >
              <option value="">-- Choose a Hotel --</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Select Room Type:</label>
            <select
              className="
                border
                rounded-md
                p-2
                w-full
                bg-white
                text-gray-700
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="">-- Choose Room Type --</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
          </div>
        </div>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md mb-6 transition-colors duration-300"
          onClick={checkAvailability}
        >
          Check Availability
        </button>
        {availability && (
          <p className="mb-6 text-gray-700">
            <span className="font-semibold">{availability.available}</span> out of{" "}
            <span className="font-semibold">{availability.total}</span> rooms available.
          </p>
        )}

        <form onSubmit={handleBookingSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-600">Your Name:</label>
            <input
              type="text"
              name="customerName"
              value={bookingForm.customerName}
              onChange={handleBookingFormChange}
              className="
                border
                rounded-md
                p-2
                w-full
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1 text-gray-600">Email:</label>
              <input
                type="email"
                name="email"
                value={bookingForm.email}
                onChange={handleBookingFormChange}
                className="
                  border
                  rounded-md
                  p-2
                  w-full
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                placeholder="example@mail.com"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Phone:</label>
              <input
                type="tel"
                name="phone"
                value={bookingForm.phone}
                onChange={handleBookingFormChange}
                className="
                  border
                  rounded-md
                  p-2
                  w-full
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                placeholder="(123) 456-7890"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1 text-gray-600">Check-In Date:</label>
              <input
                type="date"
                name="checkIn"
                value={bookingForm.checkIn}
                onChange={handleBookingFormChange}
                className="
                  border
                  rounded-md
                  p-2
                  w-full
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Check-Out Date:</label>
              <input
                type="date"
                name="checkOut"
                value={bookingForm.checkOut}
                onChange={handleBookingFormChange}
                className="
                  border
                  rounded-md
                  p-2
                  w-full
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="
              w-full
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              font-medium
              py-2
              rounded-md
              transition-colors
              duration-300
            "
          >
            Book Now
          </button>
        </form>
      </section>

      {/* Payment Section */}
      {bookingResponse && (
        <section className="bg-white shadow-lg rounded-xl p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-700">
            Payment Details
          </h2>
          <div className="mb-6">
            <p className="text-gray-700">
              <strong>Booking ID:</strong>{" "}
              <span className="font-mono text-gray-800">
                {bookingResponse.bookingId}
              </span>
            </p>
            <p className="text-gray-700">
              <strong>Hotel:</strong>{" "}
              <span className="font-semibold">
                {hotels.find((h) => h.id === selectedHotel)?.name || "N/A"}
              </span>
            </p>
            <p className="text-gray-700">
              <strong>Room Type:</strong>{" "}
              <span className="font-semibold">{roomType}</span>
            </p>
          </div>
          <form onSubmit={handlePaymentSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-600">Amount (USD):</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={paymentForm.amount}
                onChange={handlePaymentFormChange}
                className="
                  border
                  rounded-md
                  p-2
                  w-full
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                placeholder="e.g. 150.00"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Card Number:</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentForm.cardNumber}
                onChange={handlePaymentFormChange}
                className="
                  border
                  rounded-md
                  p-2
                  w-full
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                placeholder="4111111111111111"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-1 text-gray-600">Expiry (MM/YY):</label>
                <input
                  type="text"
                  name="expiry"
                  value={paymentForm.expiry}
                  onChange={handlePaymentFormChange}
                  className="
                    border
                    rounded-md
                    p-2
                    w-full
                    focus:outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                  "
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">CVV:</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentForm.cvv}
                  onChange={handlePaymentFormChange}
                  className="
                    border
                    rounded-md
                    p-2
                    w-full
                    focus:outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                  "
                  placeholder="123"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="
                w-full
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                font-medium
                py-2
                rounded-md
                transition-colors
                duration-300
              "
            >
              Pay Now
            </button>
          </form>
          {paymentResponse && (
            <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded">
              <p className="font-semibold text-green-800">Payment Confirmation:</p>
              <p className="text-green-800">{paymentResponse.message}</p>
              <p className="text-green-800">
                Transaction ID:{" "}
                <span className="font-mono">{paymentResponse.transactionId}</span>
              </p>
            </div>
          )}
        </section>
      )}

      {/* Global Message */}
      {message && (
        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded text-gray-800">
          {message}
        </div>
      )}
    </div>
  );
};

export default HotelBookingPayment;
