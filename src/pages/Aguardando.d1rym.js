// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixLocation from 'wix-location'

import {
    utils_show_hide_section,
    TRANSACAO_APROVADA,
    TRANSACAO_RECUSADA,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
} from "public/utils";

import {
    be_mod_utils_get_transaction_detail,
} from "backend/be_mod_utils";

const transaction_id = wixLocation.query.id;

let wait_change;


function set_sections(state) {
    switch (state){
        case SECTION_STATE_LOADING:
            return utils_show_hide_section(["#sectionAguardando"], ["#sectionConcluido"]);
        case SECTION_STATE_DATA:
            return utils_show_hide_section(["#sectionConcluido"], ["#sectionAguardando"]);
    }
}

function stop_wait_change() {
    clearInterval(wait_change);
}

function approve_wait() {
    const update_interval = 500; // Intervalo de tempo em milissegundos para realizar as consultas
    console.log("AGUARDANDO APROVAÇÃO...");

    wait_change = setInterval(() => {
        be_mod_utils_get_transaction_detail(transaction_id)
        .then((result) => {
            if (result.situacao == TRANSACAO_APROVADA){
                console.log("TRANSACAO APROVADA");
                set_sections(SECTION_STATE_DATA);
                stop_wait_change();
            } else if (result.situacao == TRANSACAO_RECUSADA){
                console.log("TRANSACAO RECUSADA");
                set_sections(SECTION_STATE_DATA);
                stop_wait_change();
            }
        });
    }, update_interval);
}
  

$w.onReady(function () {
    approve_wait();
    set_sections(SECTION_STATE_LOADING);
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
