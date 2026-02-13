import React from 'react';
import BookingTable from '../../Bookings/BookingTable';

const BookingsManagement = ({
  bookings,
  bookingsCurrentPage,
  bookingsTotalPages,
  setBookingsCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalBookings,
  deleteBooking,
  getRowNumber,
}) => {
  return (
    <BookingTable
      bookings={bookings}
      currentPage={bookingsCurrentPage}
      totalPages={bookingsTotalPages}
      setCurrentPage={setBookingsCurrentPage}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      totalBookings={totalBookings}
      deleteBooking={deleteBooking}
      getRowNumber={getRowNumber}
    />
  );
};

export default BookingsManagement;
