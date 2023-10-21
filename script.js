document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("searchResults");

    searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.toLowerCase();

        // データを取得
        fetch("https://yuzki.github.io/test/ewaia.json")
            .then(response => response.json())
            .then(data => {
                resultsContainer.innerHTML = "";

                for (const key in data) {
                    const items = data[key];
                    for (const item of items) {
                        if (item.abbreviation.toLowerCase().includes(searchTerm) || item.full.toLowerCase().includes(searchTerm)) {
                            const resultItem = document.createElement("div");
                            resultItem.innerHTML = `<strong>${item.abbreviation}</strong> - ${item.full} (${item.type})`;
                            resultsContainer.appendChild(resultItem);
                        }
                    }
                }
            });
    });
});
