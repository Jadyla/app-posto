// Guia de API: https://www.wix.com/velo/reference/api-overview/introduction

import { authentication } from 'wix-members';
import { currentMember } from 'wix-members';
import wixStorage from 'wix-storage';

import {
    utils_set_sections_history,
    utils_load_history,
    SECTION_STATE_LOADING,
} from 'public/utils';


async function fill_member_picture() {
    console.log("blaaaaaaa2")
	let member = await currentMember.getMember({fieldsets: [ 'FULL' ]});
	if (member.profile.profilePhoto.url)
		$w("#imageProfile").src = member.profile.profilePhoto.url;
	$w("#textOlaNome").text = `Olá, ${member.contactDetails.firstName}`;
}

$w.onReady(function () {
    console.log("blaaaaaaa3")
    return;
    wixStorage.local.clear();
    utils_set_sections_history(SECTION_STATE_LOADING);
    utils_load_history(true, "");
	fill_member_picture();

    // Escreva seu código JavaScript aqui usando o API de framework do Velo

    // Exiba hello world:
    // console.log("Hello world!");

    // Chame funções em elementos da página, por exemplo:
    // $w("#button1").label = "Clique aqui!";

    // Clique em "Executar" ou visualize seu site para executar seu código

});

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function button1_click(event) {
    authentication.logout();
}