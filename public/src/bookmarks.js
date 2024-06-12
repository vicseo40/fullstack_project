document.addEventListener('DOMContentLoaded', function() {
    const eventsColumn = document.querySelector('.events-column');

    function loadBookmarks() {
        fetch('/api/events/bookmarks')
            .then(response => response.json())
            .then(events => {
                if (events.length === 0) {
                    eventsColumn.innerHTML = '<p>No bookmarked events found.</p>';
                } else {
                    events.forEach(event => {
                        const eventArticle = document.createElement('article');
                        eventArticle.classList.add('event');
                        
                        const eventLink = document.createElement('a');
                        eventLink.href = `event.html?id=${event._id}`;

                        const eventImage = document.createElement('img');
                        eventImage.src = `/api/events/image/${event._id}`;
                        eventImage.alt = `${event.title} Image`;

                        const eventTitle = document.createElement('h3');
                        eventTitle.textContent = event.title;

                        const eventDate = document.createElement('p');
                        eventDate.innerHTML = `<i class="fa fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}`;

                        const eventLocation = document.createElement('p');
                        eventLocation.innerHTML = `<i class="fa fa-map-marker"></i> ${event.location}`;

                        eventLink.appendChild(eventImage);
                        eventLink.appendChild(eventTitle);
                        eventLink.appendChild(eventDate);
                        eventLink.appendChild(eventLocation);

                        eventArticle.appendChild(eventLink);
                        eventsColumn.appendChild(eventArticle);
                    });
                }
            })
            .catch(error => console.error('Error fetching bookmarked events:', error));
    }

    loadBookmarks();
});
