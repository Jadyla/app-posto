// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixWindowFrontend from 'wix-window-frontend';


$w.onReady(function () {
    let receivedData = wixWindowFrontend.lightbox.getContext();
    console.log(receivedData);
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
