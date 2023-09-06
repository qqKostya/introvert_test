const DOMAIN = 'https://leap74rus.amocrm.ru';
const TOKEN = {
    'token_type': 'Bearer',
    'access_token': '',
    'refresh_token': '',
};

const limit = 25;
let page = 1;

function getUrl(path) {
    return DOMAIN + path;
}

function getContacts() {
    return $.ajax({
        url: getUrl('/api/v4/contacts'),
        type: 'GET',
        data: {
            page: page,
            limit: limit,
            with: 'leads',
        },
        headers: {
            'Authorization': `${TOKEN.token_type} ${TOKEN.access_token}`,
            'Content-Type': 'application/hal+json',
            'Accept': 'application/problem+json',
        },
    });
}

function addTasks(contacts, description, completeTill) {
    const tasks = contacts
        .filter(contact => contact._embedded.leads.length === 0) 
        .map(contact => ({
            text: description,
            complete_till: completeTill,
            entity_id: contact.id,
            entity_type: 'contacts',
        }));

    if (tasks.length === 0) {
        console.log('У всех контактов есть сделки');
        return;
    }

    $.ajax({
            url: getUrl('/api/v4/tasks'),
            type: 'POST',
            data: JSON.stringify(tasks),
            headers: {
                'Authorization': `${TOKEN.token_type} ${TOKEN.access_token}`,
                'Content-Type': 'application/hal+json',
                'Accept': 'application/problem+json',
            },
        })
        .done(function (data) {
            console.log('Задачи были успешно добавлены');
            console.log(data);
        })
        .fail(function (xhr) {
            console.log('Что-то пошло не так с добавлением задач');
            console.log(xhr);
        });
}

function handleContacts(data, description, completeTill) {
    if (!data) {
        console.log('Контактов нет');
        return;
    }

    console.log('Контакты были успешно получены');
    console.log(data);

    addTasks(data._embedded.contacts, description, completeTill);

    page++;
}

function handleContactsError(xhr) {
    console.log('Что-то пошло не так с получением контактов');
    console.log(xhr);
}

function createTasksForContactsWithoutLeads(description, completeTill) {
    getContacts()
        .done(function (data) {
            handleContacts(data, description, completeTill);
        })
        .fail(handleContactsError);
}

const description = 'Контакт без сделок';
createTasksForContactsWithoutLeads(description, completeTill);