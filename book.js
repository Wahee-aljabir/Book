import { PageFlip } from "https://cdn.skypack.dev/page-flip@2.0.7";

class BookReader {
    constructor() {
        this.pageFlip = null;
        this.bookData = null;
        this.init();
    }

    async init() {
        try {
            const bookFile = this.getBookFileFromURL();
            if (!bookFile) {
                throw new Error('No book file specified. Please add ?book=filename.json to the URL');
            }

            await this.loadBookData(bookFile);
            this.renderBook();
            this.initializePageFlip();
            this.setupNavigation();
            this.hideLoading();
        } catch (error) {
            this.showError(error.message);
        }
    }

    getBookFileFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('book');
    }

    async loadBookData(bookFile) {
        try {
            const response = await fetch(bookFile);
            if (!response.ok) {
                throw new Error(`Failed to load book: ${response.status} ${response.statusText}`);
            }
            this.bookData = await response.json();
            
            // Validate book data structure
            if (!this.bookData.title || !Array.isArray(this.bookData.pages)) {
                throw new Error('Invalid book format. Expected title and pages array.');
            }
        } catch (error) {
            throw new Error(`Error loading book data: ${error.message}`);
        }
    }

    renderBook() {
        const bookPages = document.getElementById('bookPages');
        bookPages.innerHTML = '';

        // Create front cover
        const frontCover = this.createCoverPage(true);
        bookPages.appendChild(frontCover);

        // Create empty page after front cover
        const emptyPage1 = this.createEmptyPage();
        bookPages.appendChild(emptyPage1);

        // Create story pages
        this.bookData.pages.forEach((page, index) => {
            const pageElement = this.createStoryPage(page, index + 1);
            bookPages.appendChild(pageElement);
        });

        // Create empty page before back cover
        const emptyPage2 = this.createEmptyPage();
        bookPages.appendChild(emptyPage2);

        // Create back cover
        const backCover = this.createCoverPage(false);
        bookPages.appendChild(backCover);

        // Update page title
        document.title = this.bookData.title;
    }

    createCoverPage(isFront) {
        const page = document.createElement('div');
        page.className = `book-page ${isFront ? 'front-cover' : 'back-cover'}`;
        page.setAttribute('data-density', 'hard');

        if (isFront) {
            const coverContent = document.createElement('div');
            coverContent.className = 'cover-content';
            
            const title = document.createElement('h1');
            title.textContent = this.bookData.title;
            
            const subtitle = document.createElement('p');
            subtitle.textContent = this.bookData.subtitle || 'A Digital Story';
            
            coverContent.appendChild(title);
            coverContent.appendChild(subtitle);
            page.appendChild(coverContent);
        }

        return page;
    }

    createStoryPage(pageData, pageNumber) {
        const page = document.createElement('div');
        page.className = 'book-page';

        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';

        // Create image element
        if (pageData.image) {
            const img = document.createElement('img');
            img.src = pageData.image;
            img.alt = pageData.imageAlt || `Illustration for page ${pageNumber}`;
            img.className = 'story-image';
            
            // Handle image load errors
            img.onerror = () => {
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
            };
            
            pageContent.appendChild(img);
        }

        // Create text element
        if (pageData.text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'story-text';
            textDiv.textContent = pageData.text;
            pageContent.appendChild(textDiv);
        }

        page.appendChild(pageContent);
        return page;
    }

    createEmptyPage() {
        const page = document.createElement('div');
        page.className = 'book-page empty-page';
        return page;
    }

    initializePageFlip() {
        const bookPages = document.getElementById('bookPages');
        
        this.pageFlip = new PageFlip(bookPages, {
            width: 543,  // A4 ratio within 1024x768
            height: 768,
            size: "stretch",
            minWidth: 315,
            maxWidth: 1000,
            minHeight: 420,
            maxHeight: 1350,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: false
        });

        const pages = bookPages.querySelectorAll('.book-page');
        this.pageFlip.loadFromHTML(pages);
    }

    setupNavigation() {
        const prevButton = document.getElementById('prev');
        const nextButton = document.getElementById('next');

        prevButton.addEventListener('click', () => {
            if (this.pageFlip) {
                this.pageFlip.flipPrev();
            }
        });

        nextButton.addEventListener('click', () => {
            if (this.pageFlip) {
                this.pageFlip.flipNext();
            }
        });
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('container').style.display = 'block';
        document.getElementById('navigation').style.display = 'flex';
        document.getElementById('notation').style.display = 'block';
        document.getElementById('bookPages').style.display = 'block';
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'flex';
        document.getElementById('error-message').textContent = message;
    }
}

// Library initialization function
async function initLibrary() {
    try {
        const response = await fetch('/api/books');
        if (!response.ok) {
            throw new Error(`Failed to load book list: ${response.status} ${response.statusText}`);
        }
        const books = await response.json();
        
        const list = document.getElementById('book-list');
        list.innerHTML = '';
        
        if (books.length === 0) {
            list.innerHTML = '<p>No stories available. Add JSON files to the root directory.</p>';
            return;
        }
        
        books.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-item';
            
            const a = document.createElement('a');
            a.href = `book.html?book=${book}`;
            a.textContent = book.replace('.json', '').replace(/_/g, ' ').toUpperCase();
            
            div.appendChild(a);
            list.appendChild(div);
        });
    } catch (error) {
        showError(`Error loading library: ${error.message}`);
    }
}

function showError(message) {
    document.getElementById('container').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error-message').textContent = message;
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path === '/' || path.endsWith('/index.html')) {
        initLibrary();
    } else if (path.endsWith('/book.html')) {
        new BookReader();
    } else {
        showError('Unknown page');
    }
});