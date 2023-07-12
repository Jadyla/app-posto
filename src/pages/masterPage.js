import {authentication} from 'wix-members';
import wixLocation from 'wix-location';


$w.onReady(function () {
    return;
    authentication.onLogin(async (member) => {
        console.log("onLogin");
        wixLocation.to(wixLocation.url); // reactivate the router
    });
});