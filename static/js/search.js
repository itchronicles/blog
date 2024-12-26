document.addEventListener('DOMContentLoaded', function() {
    let searchIndex = null;
    const searchInputs = {
        nav: document.getElementById('search-input'),
        main: document.getElementById('main-search-input')
    };
    const resultsContainers = {
        nav: document.getElementById('search-results'),
        main: document.getElementById('main-search-results')
    };

    // Fetch the search index
    fetch('/index.json')
        .then(response => response.json())
        .then(data => {
            const options = {
                keys: [
                    'title',
                    'content',
                    'description'
                ],
                threshold: 0.3,
                ignoreLocation: true
            };
            searchIndex = new Fuse(data.posts, options);
        });

    // Handle search input for both search bars
    Object.entries(searchInputs).forEach(([key, input]) => {
        if (!input) return; // Skip if element doesn't exist

        input.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            if (searchTerm.length < 2) {
                resultsContainers[key].classList.remove('active');
                return;
            }

            const results = searchIndex.search(searchTerm);
            displayResults(results, resultsContainers[key]);
        });
    });

    // Handle clicking outside of search
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.searchButton') && !e.target.closest('.main-search-wrapper')) {
            Object.values(resultsContainers).forEach(container => {
                if (container) container.classList.remove('active');
            });
        }
    });

    function displayResults(results, container) {
        if (!results.length) {
            container.innerHTML = '<div class="search-result-item"><p>No results found</p></div>';
        } else {
            container.innerHTML = results
                .slice(0, 5)
                .map(result => `
                    <div class="search-result-item" onclick="window.location.href='${result.item.permalink}'">
                        <h3>${result.item.title}</h3>
                        <p>${result.item.description || ''}</p>
                    </div>
                `).join('');
        }
        container.classList.add('active');
    }
}); 