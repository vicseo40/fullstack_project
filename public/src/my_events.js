document.addEventListener('DOMContentLoaded', function() {
    const addEventButton = document.querySelector('.add-event');
    const modal = document.getElementById('editEventModal');
    const closeModalButton = document.getElementById('closeEditModal');
    const addEventForm = document.getElementById('edit-event-form');
    const eventsColumn = document.getElementById('events-column');

    if (addEventButton) {
        addEventButton.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (addEventForm) {
        addEventForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(addEventForm);

            try {
                const response = await fetch('/api/events/create', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (response.ok) {
                    alert('Event created successfully');
                    loadMyEvents(); // Reload to show the new event
                    modal.style.display = 'none';
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error creating event');
            }
        });
    }

    async function loadMyEvents() {
        try {
            const response = await fetch('/api/events/my');
            const events = await response.json();

            eventsColumn.innerHTML = ''; // Clear existing events

            events.forEach(event => {
                const eventElement = document.createElement('article');
                eventElement.classList.add('event');
                eventElement.innerHTML = `
                    <a href="event.html?id=${event._id}">
                        <img src="/api/events/image/${event._id}" alt="${event.title}">
                        <h3>${event.title}</h3>
                        <p><i class="fa fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</p>
                        <p><i class="fa fa-map-marker"></i> ${event.location}</p>
                        <p><i class="fa fa-users"></i> Expected Attendees: ${event.attendees.length}</p>
                        <p><strong>Category:</strong> ${event.category}</p>
                        <p><strong>Age Restriction:</strong> ${event.ageRestriction}</p>
                    </a>
                `;
                eventsColumn.appendChild(eventElement);
            });

            // Append the add event box at the end
            const addEventBox = document.createElement('article');
            addEventBox.classList.add('event', 'add-event');
            addEventBox.innerHTML = `
                <div class="add-event-icon">
                    <i class="fa fa-plus"></i>
                </div>
                <h3>Add Event</h3>
            `;
            eventsColumn.appendChild(addEventBox);

            addEventBox.addEventListener('click', () => {
                modal.style.display = 'block';
            });
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    loadMyEvents(); // Initial load of events
});
