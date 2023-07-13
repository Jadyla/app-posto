import {authentication} from 'wix-members';
import wixLocation from 'wix-location';


$w.onReady(function () {
    authentication.onLogin(async (member) => {
        console.log("onLogin");
        wixLocation.to(wixLocation.url); // reactivate the router
    });
});