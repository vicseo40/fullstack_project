let currentPage = 1;
const eventsPerPage = 6;

async function loadEvents(page, clearExisting = false) {
    const category = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => checkbox.value);
    const ageRestriction = document.querySelector('input[name="age"]:checked')?.value;
    const month = document.getElementById('month').value;
    const sort = document.querySelector('input[name="sort"]:checked')?.value;

    const queryParams = new URLSearchParams({
        page,
        limit: eventsPerPage,
        ...(category.length && { category: category.join(',') }),
        ...(ageRestriction && { ageRestriction }),
        ...(month && { month }),
        ...(sort && { sort })
    });

    try {
        const response = await fetch(`/api/events?${queryParams.toString()}`);
        const data = await response.json();
        const eventsColumn = document.getElementById('events-column');

        if (clearExisting) {
            eventsColumn.innerHTML = ''; // Clear existing events only if clearExisting is true
        }

        data.events.forEach(event => {
            const eventElement = document.createElement('article');
            eventElement.className = 'event';
            eventElement.innerHTML = `
                <a href="event.html?id=${event._id}" class="event-link">
                    <img src="/api/events/image/${event._id}" alt="${event.title}">
                    <h3>${event.title}</h3>
                    <p><i class="fa fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</p>
                    <p><i class="fa fa-map-marker"></i> ${event.location}</p>
                    <p><i class="fa fa-users"></i> Expected Attendees: ${event.attendees.length}</p>
                </a>
            `;
            eventsColumn.appendChild(eventElement);
        });

        if (data.currentPage >= data.totalPages) {
            document.getElementById('view-more-link').style.display = 'none';
        } else {
            document.getElementById('view-more-link').style.display = 'block';
        }

        // Add login check and handle unauthorized access
        fetch('/api/auth/status')
            .then(response => response.json())
            .then(authData => {
                document.querySelectorAll('.event-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        if (!authData.isAuthenticated) {
                            e.preventDefault();
                            alert('You need to log in to view more details.');
                        }
                    });
                });
            })
            .catch(error => console.error('Error fetching auth status:', error));
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

document.getElementById('view-more-link').addEventListener('click', (e) => {
    e.preventDefault();
    currentPage++;
    loadEvents(currentPage);
});

document.addEventListener('DOMContentLoaded', () => {
    loadEvents(currentPage, true);
});

document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('change', () => {
        currentPage = 1;
        loadEvents(currentPage, true);
    });
});
