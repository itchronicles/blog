document.addEventListener('DOMContentLoaded', function() {
    let searchIndex = null;
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');

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

    // Handle search input
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value;
        if (searchTerm.length < 2) {
            resultsContainer.classList.remove('active');
            return;
        }

        const results = searchIndex.search(searchTerm);
        displayResults(results);
    });

    // Handle clicking outside of search
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.searchButton')) {
            resultsContainer.classList.remove('active');
        }
    });

    function displayResults(results) {
        if (!results.length) {
            resultsContainer.innerHTML = '<div class="search-result-item"><p>No results found</p></div>';
        } else {
            resultsContainer.innerHTML = results
                .slice(0, 5)
                .map(result => `
                    <div class="search-result-item" onclick="window.location.href='${result.item.permalink}'">
                        <h3>${result.item.title}</h3>
                        <p>${result.item.description || ''}</p>
                    </div>
                `).join('');
        }
        resultsContainer.classList.add('active');
    }
}); 