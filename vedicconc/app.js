document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearchInput);
});


function handleSearchInput(event) {
    const searchInputValue = event.target.value;
    
    // 3文字目が入力された時点で検索を実行
    if (searchInputValue.length >= 2) {
        performSearch(searchInputValue);
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input').value;
    const selectedOption = document.getElementById('transliteration-option').value;
    const selectedTransliteration = selectedOption;

    // bloomfield-vc.json ファイルのデータを読み込む
    fetch('https://raw.githubusercontent.com/epicfaace/sanskrit/a851ac7bb739d7fc7379315e3d211b9ac3e1b3c5/dcs/data/bloomfield-vedic-concordance/data/bloomfield-vc.json')
        .then(response => response.json())
        .then(concData => {
            // transliteration.csv ファイルのデータを読み込む
            fetch('https://raw.githubusercontent.com/Yuzki/SktTool/master/utils/transliteration.csv')
            // fetch('./transliteration.csv')
                .then(response => response.text())
                .then(transliterationCsv => {
                    const transliterationData = parseCsv(transliterationCsv);

                    // 検索実行
                    const results = searchInData(searchInput, selectedTransliteration, concData, transliterationData);

                    // 結果表示
                    displayResults(results);
                })
                .catch(error => console.error('Error loading transliteration.csv:', error));
        })
        .catch(error => console.error('Error loading bloomfield-vc.json:', error));
}

function parseCsv(csv) {
    return csv.split('\n').map(line => line.split(','));
}

function transliterateSearchInput(searchInput, selectedTransliteration, transliterationData) {
    const transliterationMap = {};

    transliterationData.slice(1).forEach(row => {
        const iastIndex = transliterationData[0].indexOf('iast');
        transliterationMap[row[0]] = {
            [selectedTransliteration]: row[transliterationData[0].indexOf(selectedTransliteration)],
            iast: row[iastIndex],
        };
    });

    let result = searchInput;

    for (const key in transliterationMap){
        const value = transliterationMap[key];
        const selectedTransliterationValue = value[selectedTransliteration];
        const iastValue = value['iast'];

        result = result.replace(selectedTransliterationValue, iastValue)
        console.log('Input string', result)
    }
    
    return result;
}

function searchInData(query, selectedTransliteration, concData, transliterationData) {

    const iastSearchInput = transliterateSearchInput(query, selectedTransliteration, transliterationData);

    const concResults = concData
        .flatMap(item => item.cits.map(cit => ({ text: `${item.mantra} (${cit.cit})`, type: 'Conc' })))
        .filter(result => {
            if (selectedTransliteration === 'tf') {
                return result.text.includes(iastSearchInput);
            } else {
                const regex = new RegExp(iastSearchInput, 'g');
                return regex.test(result.text);
            }
        });

    return [iastSearchInput, concResults];
}

function displayResults(results) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    const searchString = results[0];
    const searchResults = results[1];

    if (searchResults.length === 0) {
        resultContainer.innerHTML = `No results found for ${searchString}`;
        return;
    }

    // searchStringを先頭に追加
    const resultItem = document.createElement('div');
    resultItem.textContent = `Results for ${searchString}`;

    searchResults.forEach(result => {
        // result.textを続けて追加
        const textItem = document.createElement('div');
        textItem.textContent = result.text;
        resultItem.appendChild(textItem);
    });

    resultContainer.appendChild(resultItem);
}
