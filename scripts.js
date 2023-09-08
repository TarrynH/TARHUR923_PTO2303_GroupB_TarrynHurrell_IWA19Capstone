import {BOOKS_PER_PAGE, authors, genres, books} from './data.js'


let matches = books
let page = 1
let range = [0, 36]

if (!books && !Array.isArray(books)) throw new Error('Source required') 
if (!range && range.length < 2) throw new Error('Range must be an array with two numbers')

/**
 * Shows the styling properties for both the text and background in both day and night theme settings.
 */
const css = {
    day: {
        text: '10, 10, 20',
        background: '255, 255, 255',
    },
    night: {
        text: '255, 255, 255',
        background: '10, 10, 20',
    }
}

/**
 * An object literal that contains references to all the HTML elements that will be referenced in this code, and keeps it organised and neat.
 */
const data = {
    header: {
        search: document.querySelector('[data-header-search]'),
        settings: document.querySelector('[data-header-settings]'),
    },
    list: {
        items: document.querySelector('[data-list-items]'),
        message: document.querySelector('[data-list-message]'),
        button: document.querySelector('[data-list-button]'),
        active: document.querySelector('[data-list-active]'),
        blur: document.querySelector('[data-list-blur]'),
        image: document.querySelector('[data-list-image]'),
        title: document.querySelector('[data-list-title]'),
        subtitle: document.querySelector('[data-list-subtitle]'),
        description: document.querySelector('[data-list-description]'),
        close: document.querySelector('[data-list-close]'),
    },
    search: {
        overlay: document.querySelector('[data-search-overlay]'),
        form: document.querySelector('[data-search-form]'),
        title: document.querySelector('[data-search-title]'),
        genres: document.querySelector('[data-search-genres]'),
        authors: document.querySelector('[data-search-authors]'),
        cancel: document.querySelector('[data-search-cancel]'),
    },
    settings: {
        overlay: document.querySelector('[data-settings-overlay]'),
        form: document.querySelector('[data-settings-form]'),
        theme: document.querySelector('[data-settings-theme]'),
        cancel: document.querySelector('[data-settings-cancel]')
    }
}


const fragment = document.createDocumentFragment()
let currentPage = 0


/**
 * Retrieves the values of each genre from the genres object.
 */
const getGenreName = (genreId) => {
    return genres[genreId]
}


/*
 * Maps over the books array and creates a new Object called preview which contains only the id, image, title and author values of each book object.
 */
const createPreviewItems = (page) => {
    const startIndex = page * BOOKS_PER_PAGE
    const endIndex = startIndex + BOOKS_PER_PAGE
    const currentPageItems = books.slice(startIndex, endIndex)
  
    const preview = currentPageItems.map( book => {
        const { image, title, author, genres, id } = book
        const genreNames = genres.map((genreId) => getGenreName(genreId))
        return { image, title, author: authors[author], genres: genreNames, id }
    } )
    return preview
}
  

/**
 * Creates a list of book previews showing the title and author of each book along with an image of the book cover.
 */
const createPreviewsFragment = (page) => {

    const previewItems = createPreviewItems(page)
  
    for (const book of previewItems) {
        const previewList = document.createElement('button')
        previewList.className = 'preview'

        previewList.innerHTML = /*html*/ `
            <img
                class="preview__image"
                src="${book.image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${book.title}</h3>
                <div class="preview__author">${book.author}</div>
                <div class="preview_hidden">${book.id}</div>
            </div>
        `
        // Added in css for the hidden genre
        fragment.append(previewList)
    } 
    data.list.items.appendChild(fragment)

    data.list.button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${matches.length - BOOKS_PER_PAGE})</span>`
}
createPreviewsFragment(currentPage) // This function is called here to display the first page of 36 books as the web page loads. 


/**
 * When a book from the list of books is clicked, it shows a book summary overlay containing the image, title, author, publishing year and description. 
 */
const createBookSummaryHtml = (event) => {

    const clickedBookID = event.currentTarget.querySelector('.preview_hidden').textContent
    const clickedBook = books.find((book) => book.id === clickedBookID);

    if (clickedBook) {
        const { image, title, author, published, description } = clickedBook

        const authorName = authors[author]
        const publishedYear = new Date(published).getFullYear()
        const overlayHiddenId = document.querySelector('.preview_hidden')

        data.list.image.src = image
        data.list.blur.src = image
        overlayHiddenId.textContent = clickedBookID
        data.list.title.textContent = title
        data.list.subtitle.textContent = `${authorName} (${publishedYear})`
        data.list.description.textContent = description

        data.list.active.style.display = 'block' // Shows the overlay.
    } 
}

/**
 * When the 'close' button on the book summary overlay is clicked, it closes the overlay.
 */
const closeSummaryOverlay = () => {
    data.list.active.style.display = 'none'
}


/**
 * When you click on the "Show more" button at the bottom of the list of book previews, it shows a further 36 book previews.
 */
const showMoreButton = () => {
    currentPage++
    const nextPage = currentPage + 1
    const startIndex = nextPage * BOOKS_PER_PAGE

    if (startIndex < books.length) {
        createPreviewsFragment(nextPage)
        attachEventListenersToPreviews()
    } else {
        data.list.button.disabled = 'true'
    }
    data.list.button.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${matches.length - (currentPage * BOOKS_PER_PAGE) > 0 ? matches.length - (currentPage * BOOKS_PER_PAGE) : 0})</span>
        `
}


const genreArray = Object.values(genres)
const genreFragment = document.createDocumentFragment()

/**
 * Creates options for each genre in the search overlay so the user can select which genre they  want to look for.
 */
const addGenreOptions = () => {
    const allGenresOption = document.createElement('option')
    allGenresOption.innerText = 'All Genres'
    genreFragment.append(allGenresOption)

    for (const genre of genreArray) {
        const genreOption = document.createElement('option')
        genreOption.innerText = genre
        genreFragment.append(genreOption)
    }
    data.search.genres.appendChild(genreFragment) 
}
addGenreOptions()


/**
 * Checks for any duplicate authors and removes them from the authors list and then displays the new array without duplicates.
 */
const authorArray = Object.values(authors)
const uniqueAuthors = []
for (const author of authorArray) {
    if (!uniqueAuthors.includes(author)) {
        uniqueAuthors.push(author)
    }
}
const authorFragment = document.createDocumentFragment()
/**
 * Creates options for each author in the search overlay so the user can select which author they  want to look for. Exactly like {@link addGenreOptions}
 */
const addAuthorOptions = () => {
    const allAuthorsOption = document.createElement('option')
    allAuthorsOption.innerText = 'All Authors'
    authorFragment.append(allAuthorsOption)

    for (const author of uniqueAuthors) {
        const authorOption = document.createElement('option')
        authorOption.innerText = author 
        authorFragment.append(authorOption)
    }
    data.search.authors.appendChild(authorFragment)
}
addAuthorOptions()

/**
 * When you click on the search icon in the header bar it opens a search overlay where you can search for a specific book title and/or author and/or genre.
 */
const searchToggle = () => {
    data.search.overlay.show() 
    data.search.title.focus()
}


/**
 * When you click the "cancel" button in the search overlay it closes the search overlay without searching for any item, and resets the form.
 */
const cancelSearch = () => {
    data.search.overlay.close()
    data.search.form.reset()
}


/**
 * When you click on the settings icons in the header bar it opens the settings overlay where you can change the theme of the web page.
 */
const settingsToggle = () => {
    data.settings.overlay.show()
}


/**
 * When you click the "cancel" button in the settings overlay, it closes the settings overlay without changing the theme of the webpage, and resets the settings form.
 */
const cancelSettings = () => {
    data.settings.overlay.close()
    data.settings.form.reset()
}


/**
 * This maps over the books array to extract certain values and create a new object containing only those values. While mapping over the books array, it also maps over each genre array inside the each book object and returns the values of each genre for each new object.
 */
const booksList = books.map( book => {
    const { image, title, author, genres, id } = book
    const genreNames = genres.map((genreId) => getGenreName(genreId))
    return { image, title, author: authors[author], genres: genreNames, id }
} )


let displayedBooksStartIndex = 0
let filteredBooks = []

/**
 * This function creates form data from the form fields: title, author and genre. It then loops over the {@link booksList} object and checks if the title, author and genre from the form match any book in the books array. If it matches each of the criteria, then it adds this book to an array. It then calls another function {@link displayFilteredPreviews} which creates the html for these new previews.
 */
const searchForm = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    filteredBooks = []

    for (const book of booksList) {
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())
        const authorMatch = filters.author === 'All Authors' || book.author === filters.author
        const genreMatch = filters.genre === 'All Genres' || book.genres.some(genre => genre === filters.genre) // If the genre selected in the search form matches any of the genres in any of the book objects, it retruns genreMatch as true. This some function is a simple way to display this functionality.

        if (titleMatch && authorMatch && genreMatch) {
            filteredBooks.push(book)
        }
    }
    displayedBooksStartIndex = 0

    currentPage = 0 
    displayFilteredPreviews()
    
    if (filteredBooks.length < 1) {
        data.list.message.classList.add('list__message_show')
        const button = document.querySelector('.list__button')
        button.disabled = true 
       console.log(data.list.button, button)
    } else {
        data.list.message.classList.remove('list__message_show')
    }

    const initial = matches.length - (page * BOOKS_PER_PAGE)
    const hasRemaining = initial > 0
    const remaining = hasRemaining ? initial : 0
    data.list.button.disabled = initial <= 0
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
    data.search.form.reset()
    data.search.overlay.close()
}



/**
 * This function creates the html for each book preview that matches the criteria entered into the form. This function is called sbove in the {@link searchForm} function to create the html for the previews and appends it to the web page.
 */
const displayFilteredPreviews = () => {
    const startIndex = displayedBooksStartIndex
    const endIndex = startIndex + BOOKS_PER_PAGE;
    const currentPageBooks = filteredBooks.slice(startIndex, endIndex)

    const fragment = document.createDocumentFragment()

    for (const book of currentPageBooks) {
        const previewList = document.createElement('button')
        previewList.className = 'preview'

        previewList.innerHTML = ""
        previewList.innerHTML = /*html*/ `
            <img
                class="preview__image"
                src="${book.image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${book.title}</h3>
                <div class="preview__author">${book.author}</div>
                <div class="preview_hidden">${book.id}</div>
            </div>
        `

        fragment.append(previewList)
    }

    data.list.items.innerHTML = ''
    data.list.items.appendChild(fragment)

    displayedBooksStartIndex = endIndex
    const remainingBooks = filteredBooks.length - displayedBooksStartIndex
    data.list.button.textContent = `Show more (${remainingBooks > 0 ? remainingBooks : 0})`
    data.list.button.disabled = currentPageBooks <= 0
    attachEventListenersToPreviews() 
}


data.settings.theme.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
const v = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches? 'night' : 'day'

document.documentElement.style.setProperty('--color-dark', css[v].text);
document.documentElement.style.setProperty('--color-light', css[v].background);


/**
 * When you click the "submit" button in the settings overlay, it changes the theme to the chosen theme and closes the settings overlay.
 * @param {*} event 
 */
const submitSettings = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const result = formData.get('theme') 
    document.documentElement.style.setProperty('--color-dark', css[result].text)
    document.documentElement.style.setProperty('--color-light', css[result].background) 
    
    data.settings.overlay.close()
}



/**
 * This function ensures that all the newly created preview elements will show their respective book summary overlay when clicked on. As the book previews are created multiple times, this fucntion needs to be called several times in the code to ensure all book previews have this function.
 */
const attachEventListenersToPreviews = () => {
    const previewButtons = document.querySelectorAll('.preview')
    previewButtons.forEach((preview) => {
      preview.addEventListener('click', createBookSummaryHtml)
    })
  }
  attachEventListenersToPreviews()


data.list.close.addEventListener('click', closeSummaryOverlay)
data.list.button.addEventListener("click", showMoreButton)
data.header.search.addEventListener('click', searchToggle)
data.search.cancel.addEventListener('click', cancelSearch)
data.header.settings.addEventListener('click', settingsToggle)
data.settings.cancel.addEventListener('click', cancelSettings)
data.search.form.addEventListener('submit', searchForm)
data.settings.overlay.addEventListener('submit', submitSettings) 
