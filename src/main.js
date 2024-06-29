import iziToast from 'izitoast';
import {
  EVENT_TYPE,
  MESSAGES,
  MESSAGES_BG_COLORS,
  showInfoMessage,
  refs,
} from './js/helpers';

import { getGalleryData } from './js/pixabay-api';
import { fetchGallery } from './js/render-functions';

const { form, gallery, loadBtn } = refs;

let queryString = '';
let currentPage = 1;
let evtType = '';

const IMAGE_MAX_COUNT = 15;

form.addEventListener('submit', async e => {
  e.preventDefault();
  loadBtn.classList.remove('visible');

  gallery.innerHTML = '';
  currentPage = 1;

  const search = e.target.search.value.trim();

  evtType = EVENT_TYPE.submit;

  iziToast.destroy();

  queryString = search;

  if (!search) {
    showInfoMessage(MESSAGES.info, MESSAGES_BG_COLORS.blue);
    return;
  }
  try {
    await renderGallery(queryString, currentPage);
  } catch (error) {
    console.log('submit', error);
    showInfoMessage(MESSAGES.exception + error, MESSAGES_BG_COLORS.orange);
  }
  e.target.reset();
});

loadBtn.addEventListener('click', async () => {
  evtType = EVENT_TYPE.click;
  loadBtn.classList.remove('visible');
  try {
    await renderGallery(queryString, currentPage);
    const liEl = document.querySelector('li');
    const { height } = liEl.getBoundingClientRect();
    scrollVertical(height * 3, 0);
  } catch (error) {
    console.log('click', error);
    showInfoMessage(MESSAGES.exception + error, MESSAGES_BG_COLORS.orange);
  }
});

async function renderGallery(searchValue, page) {
  if (evtType === EVENT_TYPE.click) {
    page += 1;
    currentPage = page;
  }
  try {
    const galleryData = await getGalleryData(searchValue, page);

    if (validateGalleryData(galleryData)) {
      const restOfImages = Math.round(galleryData.totalHits / page);
      fetchGallery(galleryData);
      showHideBtn(restOfImages);
    }
  } catch (error) {
    console.log('renderGallery', error);
    showInfoMessage(MESSAGES.exception + error, MESSAGES_BG_COLORS.orange);
  }
  removeLoader();
}

function scrollVertical(x = 0, y = 0) {
  window.scrollBy({ top: x, left: y, behavior: 'smooth' });
}

function removeLoader() {
  const loaderWrapper = document.querySelector('.loader-wrapper');
  loaderWrapper.remove();
}

function validateGalleryData(galleryData) {
  if (!galleryData) {
    return false;
  } else if (galleryData.totalHits === 0) {
    showInfoMessage(MESSAGES.warning, MESSAGES_BG_COLORS.red);
    return false;
  } else {
    return true;
  }
}

function showHideBtn(imagesCount) {
  if (imagesCount <= IMAGE_MAX_COUNT) {
    loadBtn.classList.remove('visible');
    showInfoMessage(MESSAGES.endOfSearch, MESSAGES_BG_COLORS.blue);
    return;
  }
  loadBtn.classList.add('visible');
}
