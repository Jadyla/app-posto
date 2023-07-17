// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

import wixStorage from 'wix-storage';
import wixLocation from 'wix-location'

import { 
    utils_fmt_money_prefix_to_cents,
    utils_fmt_money_with_prefix,
    utils_config_items,
    utils_show_hide_section,
    utils_get_saldo,
    utils_get_member,
    app_colors,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    TRANSACAO_PENDENTE,
} from "public/utils";

import {
    be_mod_utils_cadastrar_transacao,
} from "backend/be_mod_utils";

const porcentagem_cashback = 0.05;

let abastecer_values = JSON.parse(wixStorage.local.getItem('abastecer_values'));
let valor_abastecimento = abastecer_values.valor;
let tipo_combustivel = abastecer_values.tipo_combustivel;

let bomba_information = JSON.parse(wixStorage.local.getItem('bomba_information'));
let posto_id = bomba_information.postoId;
let cod_bomba = bomba_information.codBomba;

let tipo_de_pagamento;

let g_confirmar_pagamento = [
    {ui: "#textValorAbastecer", type: "text", raw: valor_abastecimento},
    {ui: "#textTipoCombustivel", type: "text", raw: tipo_combustivel},
    {ui: "#textCashback", type: "text", raw: "Ganhar " + utils_fmt_money_with_prefix(calculate_caskback_value())},
    {ui: "#textValorTotalResume", type: "text", raw: valor_abastecimento},
    {ui: "#boxUsarSaldo", onClick: onclick_usar_saldo},
    {ui: "#boxCashback", onClick: onclick_acumular_cashback},
    {ui: "#buttonConfirmarPagamentoAvancar", onClick: onclick_confirmar_pagamento}
];


async function set_saldo() {
    let saldo = await utils_get_saldo();
    $w("#textUsarSaldoDescontar").text = "Descontar " + utils_fmt_money_with_prefix(saldo);
}

function calculate_caskback_value() {
    let cashback = utils_fmt_money_prefix_to_cents(valor_abastecimento) * porcentagem_cashback;
    return cashback;
}

async function onclick_usar_saldo() {
    set_resume_values(false, await utils_get_saldo());
}

function onclick_acumular_cashback() { 
    set_resume_values(true);
}

function set_resume_values(is_cashback, value) {
    if (is_cashback) {
        $w("#boxUsarSaldo").style.borderColor = app_colors.blue_gray_opacity;
        $w("#boxCashback").style.borderColor = app_colors.orange;
        $w("#textCashbackResume").text = "+ " + utils_fmt_money_with_prefix(calculate_caskback_value());
        $w("#textUsarSaldoResume").text = "- " + utils_fmt_money_with_prefix(0);
        $w("#textValorAPagar").text = valor_abastecimento;
        tipo_de_pagamento = "cashback";
    } else {
        $w("#boxUsarSaldo").style.borderColor = app_colors.orange;
        $w("#boxCashback").style.borderColor = app_colors.blue_gray_opacity;
        $w("#textCashbackResume").text = "+ " + utils_fmt_money_with_prefix(0);
        $w("#textUsarSaldoResume").text = "- " + utils_fmt_money_with_prefix(value);
        let valor_a_pagar = utils_fmt_money_prefix_to_cents(valor_abastecimento) - value;
        $w("#textValorAPagar").text = utils_fmt_money_with_prefix(valor_a_pagar);
        tipo_de_pagamento = "pagamento_saldo";
    }
    $w("#buttonConfirmarPagamentoAvancar").enable();
}

function set_sections(state) {
    switch (state){
        case SECTION_STATE_LOADING:
            return utils_show_hide_section(["#sectionLoading"], ["#sectionSelectPagamentoOption", "#sectionPagamentoResume", "#sectionValorAPagar"]);
        case SECTION_STATE_DATA:
            return utils_show_hide_section(["#sectionSelectPagamentoOption", "#sectionPagamentoResume", "#sectionValorAPagar"], ["#sectionLoading"]);
    }
}

async function onclick_confirmar_pagamento() {
    let member = await utils_get_member();
    let saldo = await utils_get_saldo();
    let transacao = {
        clienteId: member._id,
        postoId: posto_id,
        tipo: tipo_de_pagamento,
        tipoCombustivel: tipo_combustivel,
        valor: utils_fmt_money_prefix_to_cents(valor_abastecimento),
        valorTipo: tipo_de_pagamento == "cashback" ? calculate_caskback_value() : (saldo * -1),
        situacao: TRANSACAO_PENDENTE,
        codBomba: cod_bomba,
    };

    be_mod_utils_cadastrar_transacao(transacao).then((transacao_id) => {
        const urlComId = `/aguardando?id=${transacao_id}`;
        set_sections(SECTION_STATE_LOADING);
        wixLocation.to(urlComId);
    });
}

$w.onReady(function () {
    set_sections(SECTION_STATE_DATA);
    utils_config_items($w, g_confirmar_pagamento);
    set_saldo();
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
