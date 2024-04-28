htmx.config.debug = true; // Enable debug mode for this specific event handler
document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('image-form');
    const imageContainer = document.getElementById('image-container');
    const spinner = document.getElementById('spinner');

    // const downloadButton = document.getElementById('download-btn');


// SPINNER    

    document.body.addEventListener('htmx:beforeRequest', function () {
        spinner.classList.remove('hidden');
    });

// IMAGE CONTAINER

// Retrieve the cached image on page load
const cachedImage = localStorage.getItem('cachedImage');
if (cachedImage) {
  document.getElementById('myImage').src = cachedImage;
}

document.body.addEventListener('htmx:afterRequest', function (event) {
    console.log('htmx:afterRequest event triggered!');
    const response = event.detail.xhr.responseText;
    console.log('Response: ', response);
    try {
      const jsonData = JSON.parse(response);
      if (jsonData && jsonData.imageUrl) {
        const imageUrl = jsonData.imageUrl;
        updateImageContainer(imageUrl); // Update the image container with the new image URL
      } else if (jsonData && jsonData.error && jsonData.error === "Image generation rate limit exceeded. Please try again tomorrow.") {
        // Display the 429 error message
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = jsonData.error;
        // Set error message to empty after 20 seconds
        setTimeout(() => {
          errorMessageElement.textContent = '';
        }, 10000);
      } else if (jsonData && jsonData.error) {
        // Display the error message
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = jsonData.error;
        // Set error message to empty after 20 seconds
        setTimeout(() => {
          errorMessageElement.textContent = '';
        }, 10000);
      }
    } catch (error) {
      console.error('Error parsing JSON response', error);
      const errorMessageElement = document.getElementById('error-message');
      errorMessageElement.textContent = 'Error parsing JSON response';
    }
    spinner.classList.add('hidden');
  });



    function updateImageContainer(imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        imageContainer.innerHTML = '';  // Clear the container
        imageContainer.appendChild(img);  // Add the new image to the container
    }

    // // Check if there is a cached image URL and update elements download link
    // const cachedImageUrl = sessionStorage.getItem('cachedImageUrl');
    // if (cachedImageUrl) {
    //     console.log('Cached image URL found: ', cachedImageUrl);
    //     // updateDownloadLink(cachedImageUrl);
    // }


    // // Check if there is a cached image URL and update elements
    // if (cachedImageUrl) {
    //     imageContainer.innerHTML = `<img id="image" src="${cachedImageUrl}">`;
    //     console.log('image container inner html set to: ' + imageContainer.innerHTML);
    //     // downloadButton.href = cachedImageUrl;
    //     // downloadButton.download = 'image.png';
    // }


// DOWNLOAD BUTTON EVENT LISTENER

    // document.getElementById('download-btn').addEventListener('click', function (e) {
    //     e.preventDefault();  // Prevent the default anchor behavior
    //     console.log('Download clicked');

        

    //     // Simulate a click on the downloadButton to download the image
    //     downloadButton.click();
    // });


    function resetField() {
        document.getElementById("prompt-input").value = "";
    }


    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        resetField(); // Call the resetField() function
    });
    resetField();

});



