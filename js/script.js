const form = document.querySelector('.form');
const input = form.elements.search;
const resultsList = document.querySelector('.results__list');
const formControls = document.querySelector('.form__controls');
const notFound = document.querySelector('.not__found');
const serverError = document.querySelector('.error');
const startStateResult = document.querySelector('.startStateResult');
const container = document.querySelector('.container');

const NUMBER_OF_RESULTS = 10;

form.addEventListener('submit', onSubmit);
input.addEventListener('input', onInput);


function onSubmit(event) {
    event.preventDefault();
    const searchString = input.value.trim();

    if (searchValidation(searchString)) requestToGithub(searchString);
    else return;
}

function searchValidation(inputString) {
    const errorMessages = [...form.querySelectorAll('.error__message')];
    errorMessages.forEach(el => el.remove());

    if (inputString.length < 3) {
        formControls.append(createErrorText('Необходимо ввести не менее 3 символов'));
        return false;
    }
    return true;
}


function createErrorText(text) {
    const errorText = document.createElement('div');
    errorText.className = 'error__message';
    errorText.textContent = text;
    return errorText;
}

function onInput(event) {
    const errorMessageElement = event.target.parentElement.querySelector('.error__message');
    errorMessageElement?.remove();
}

function requestToGithub(searchString) {
    startStateResult.classList.add('isShow');
    container.classList.add('isStart');
    
    clearWorkSpace();
    search(searchString)
        .then(results => {
            notFound.classList.toggle('isShow', results.length === 0);

            results.forEach(result => {
                const resultItem = printSearchResult(result);
                console.log(resultItem);
                resultsList.append(resultItem);
            });
        })
        .catch(error => {
            serverError.textContent = error;
            serverError.classList.add('isShow');
        })
        ;
}

function clearWorkSpace() {
    resultsList.innerHTML = ' ';

    serverError.classList.remove('isShow');
}

async function search(query, resultCount = NUMBER_OF_RESULTS) {
    let githubResponse = await fetch('https://api.github.com/search/repositories?q=' + query + '&per_page=' + resultCount);                                                                //Консоль
    githubResponse = await githubResponse.json();


    if (!githubResponse.items) return Promise.reject(githubResponse.message);

    console.log(githubResponse.items);

    const searchResults = githubResponse.items.slice(0, resultCount).map(item => ({
        userName: item.owner.login,
        userLogo: item.owner.avatar_url,
        userLink: item.owner.html_url,
        repositoryName: item.name,
        description: item.description || '-',
        repositoryLink: item.html_url
    }));

    return searchResults;
}

function printSearchResult({ userName, userLogo, repositoryName, date, description, userLink, repositoryLink }) {
    const item = document.createElement('li');
    item.className = 'result';
    item.innerHTML = `
    <a href="${userLink}" target="_blank" class="user">
      <div class="user__name" title="${userName}">${userName}</div>
      <img src="${userLogo}" alt="Аватар пользователя" class="user__img">
    </a>
    <div class="repository">
      <a href="${repositoryLink}" target="_blank" class="repository__name">${repositoryName}</a>
      <div class="repository__description">${description}</div>
    </div>`;
    return item;
}