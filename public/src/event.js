document.addEventListener('DOMContentLoaded', async () => {
    const eventId = new URLSearchParams(window.location.search).get('id');
    const eventTitle = document.getElementById('event-title');
    const eventImage = document.getElementById('event-image');
    const eventDate = document.getElementById('event-date');
    const eventLocation = document.getElementById('event-location');
    const eventOrganizer = document.getElementById('event-organizer');
    const eventDescription = document.getElementById('event-description');
    const eventAttendees = document.getElementById('event-attendees');
    const eventCategory = document.getElementById('event-category');
    const eventAgeRestriction = document.getElementById('event-age-restriction');
    const actionButtons = document.getElementById('action-buttons');
    const editEventModal = document.getElementById('editEventModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const editEventForm = document.getElementById('edit-event-form');

    let currentUserId;

    // Fetch current user
    try {
        const userResponse = await fetch('/api/users/current');
        const userData = await userResponse.json();
        currentUserId = userData._id;
    } catch (error) {
        console.error('Error fetching current user:', error);
    }

    // Fetch event details
    try {
        const response = await fetch(`/api/events/${eventId}`);
        const event = await response.json();

        eventTitle.textContent = event.title;
        eventImage.src = `/api/events/image/${event._id}`;
        eventDate.innerHTML = `<i class="fa fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}`;
        eventLocation.innerHTML = `<i class="fa fa-map-marker"></i> ${event.location}`;
        eventOrganizer.innerHTML = `<i class="fa fa-user"></i> Organizer: ${event.creator.username}`;
        eventDescription.textContent = event.description;
        eventCategory.innerHTML = `<i class="fa fa-tag"></i> Category: ${event.category}`;
        eventAgeRestriction.innerHTML = `<i class="fa fa-child"></i> Age Restriction: ${event.ageRestriction}`;
        eventAttendees.innerHTML = `<i class="fa fa-users"></i> Attendees: ${event.attendees.length}`;

        // Check if the current user is the creator of the event
        if (currentUserId === event.creator._id) {
            // Show edit and delete buttons for event creator
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('event-button', 'edit-button');
            editButton.addEventListener('click', () => {
                editEventForm.title.value = event.title;
                editEventForm.date.value = new Date(event.date).toISOString().split('T')[0];
                editEventForm.location.value = event.location;
                editEventForm.description.value = event.description;
                editEventForm.category.value = event.category;
                editEventForm.ageRestriction.value = event.ageRestriction;
                editEventModal.style.display = 'block';
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('event-button', 'delete-button');
            deleteButton.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this event?')) {
                    try {
                        const deleteResponse = await fetch(`/api/events/${event._id}`, {
                            method: 'DELETE'
                        });
                        if (deleteResponse.ok) {
                            alert('Event deleted successfully');
                            window.location.href = 'my_events.html';
                        } else {
                            alert('Error deleting event');
                        }
                    } catch (error) {
                        console.error('Error deleting event:', error);
                        alert('Error deleting event');
                    }
                }
            });

            actionButtons.appendChild(editButton);
            actionButtons.appendChild(deleteButton);
        } else {
            // Show attend/unattend buttons for other users
            const isAttending = event.attendees.some(attendee => attendee._id === currentUserId);

            if (isAttending) {
                const unattendButton = document.createElement('button');
                unattend
                unattendButton.textContent = 'Unattend';
                unattendButton.classList.add('event-button', 'attend-button');
                unattendButton.addEventListener('click', async () => {
                    try {
                        const unattendResponse = await fetch(`/api/events/${event._id}/unattend`, {
                            method: 'POST'
                        });
                        if (unattendResponse.ok) {
                            alert('Successfully unattended the event');
                            window.location.reload();
                        } else {
                            alert('Error unattending the event');
                        }
                    } catch (error) {
                        console.error('Error unattending event:', error);
                        alert('Error unattending event');
                    }
                });
                actionButtons.appendChild(unattendButton);
            } else {
                const attendButton = document.createElement('button');
                attendButton.textContent = 'Attend';
                attendButton.classList.add('event-button', 'attend-button');
                attendButton.addEventListener('click', async () => {
                    try {
                        const attendResponse = await fetch(`/api/events/${event._id}/attend`, {
                            method: 'POST'
                        });
                        if (attendResponse.ok) {
                            alert('Successfully attending the event');
                            window.location.reload();
                        } else {
                            alert('Error attending the event');
                        }
                    } catch (error) {
                        console.error('Error attending event:', error);
                        alert('Error attending event');
                    }
                });
                actionButtons.appendChild(attendButton);
            }
        }
    } catch (error) {
        console.error('Error fetching event:', error);
    }

    // Close edit modal
    closeEditModal.addEventListener('click', () => {
        editEventModal.style.display = 'none';
    });

    // Handle edit event form submission
    editEventForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(editEventForm);
        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'PUT',
                body: formData
            });
            if (response.ok) {
                alert('Event updated successfully');
                editEventModal.style.display = 'none';
                window.location.reload();
            } else {
                const result = await response.json();
                alert(result.message);
            }
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Error updating event');
        }
    });
});

