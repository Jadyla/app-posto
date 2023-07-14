import { currentMember } from 'wix-members';
import { be_mod_utils_get_history, be_mod_utils_get_saldo } from "backend/be_mod_utils";

const IMG_PAGAMENTO_SALDO = "https://static.wixstatic.com/media/88a711_9162dc18460547c794940a110eae3acd~mv2.png";
const IMG_CASHBACK = "https://static.wixstatic.com/media/88a711_d7f511ac9b884bbca345e15d9d1703fa~mv2.png";
const IMG_PAGAMENTO = "https://static.wixstatic.com/media/88a711_9162dc18460547c794940a110eae3acd~mv2.png";

const TEXT_PAGAMENTO_SALDO = "Pagamento c/ saldo";
const TEXT_CASHBACK = "Cashback";
const TEXT_PAGAMENTO = "Pagamento";

export const SECTION_STATE_LOADING="loading";	// loading
export const SECTION_STATE_DATA="data";			// true for transactions
export const SECTION_STATE_NO_DATA="no_data";	// empty (no transactions)

export const TRANSACAO_PENDENTE = "pendente";
export const TRANSACAO_APROVADA = "aprovada";
export const TRANSACAO_RECUSADA = "recusada";

const QTDE_ITENS_RESUMO = 2; // max number of transactions on resume

// transaction history repeater: constant on utils to be used by 'Extrato' and 'Home' pages
export let g_hist_map = [
	{ui: "#textHistDate", db: "data", type: "text", format: utils_fmt_date},
	{ui: "#imageHist", db: "tipo", type: "src", format: utils_fmt_history_img},
	{ui: "#textHistValue", db: "db", type: "html", format: utils_fmt_hist_value},
	{ui: "#textHistDesc", db: "nome", type: "text"},
	{ui: "#textHistPaymentType", db: "tipo", type: "text", format: utils_fmt_history_type},
	{ui: "#textHistTotalValue", db: "total", type: "text", format: utils_fmt_hist_total_value}
];

export const hist_filters = {"date": "#dropdownFilterDate", "transaction": "#dropdownFilterTransaction"};

export const app_colors = {
	"orange": "#F49620", 
	"blue": "#0C2538",
	"blue_gray_opacity": "rgba(58, 80, 96, 0.2)",
	"red": "#E35D3D"
}

// -------------- fmt functions --------------------
export function utils_fmt_money_with_prefix(value) {
	value = utils_fmt_money(value);
	return "R$ " + (value || "0,00")
}

export function utils_fmt_hist_value(value) {
	let fmt_value = utils_fmt_money_with_prefix(value);
	let amount = fmt_value.includes("-") ? fmt_value.replace('-', '') : fmt_value;
	if (value < 0)
		return `<h4 style="color:${app_colors.red};" class="wixui-rich-text__text">- ${amount}</h4>`
	return `<h4 class="wixui-rich-text__text">+ ${amount}</h4>`
}

export function utils_fmt_hist_total_value(value) {
	return "Valor abastecimento: " + utils_fmt_money_with_prefix(value);
}

export function utils_fmt_money(val) { // receive in cents or in string in Locale
	val = val ?? "";
	let is_negative;

	if (typeof(val) == "string")
		is_negative = val[0] == '-';
	else
		is_negative = val < 0;

    val = utils_fmt_strip_non_digits(val.toString());

    if (val && val.length)
        val = (parseInt(val)/100).toLocaleString(undefined, {minimumFractionDigits: 2});

    return is_negative ? "-" + val : val;
}

export function utils_fmt_money_prefix_to_cents(value) {
	let amount_cents = parseFloat(value.replace("R$ ", "")) * 100;
	return amount_cents;
}

export function utils_fmt_strip_non_digits(value) {
	return value ? value.toString().replace(/\D/g,'') : "";
}

export function utils_fmt_date(date) {
	if (!date)
		return "";
	date = new Date(date)
	return date.toLocaleString().split(/[\s,]+/)[0];
}

export function utils_fmt_history_img(val) {
    const history_img_map = {
        "pagamento_saldo": IMG_PAGAMENTO_SALDO,
        "cashback": IMG_CASHBACK,
        "pagamento": IMG_PAGAMENTO,
    };
    return history_img_map[val] ?? "";
}

export function utils_fmt_history_type(val) {
    const history_type_map = {
        "pagamento_saldo": TEXT_PAGAMENTO_SALDO,
        "cashback": TEXT_CASHBACK,
        "pagamento": TEXT_PAGAMENTO,
    };
    return history_type_map[val] ?? "";
}

export function utils_fmt_only_number(val) {
	val = val ?? "";

	if (parseInt(val[0])){
		return val[0];
	}
}

export async function utils_fmt_saldo() {
	$w("#textSaldoEmConta").text = utils_fmt_money_with_prefix(await utils_get_saldo());
}


// -------------- config functions --------------------
export function utils_config_items($w, config, data) {
	for (let item of config) {
		let k = item.ui;
		let val = item.db ? data[item.db] : item.raw;
		val = item.fmt_from_db ? item.fmt_from_db(val) : val;
		
		let type = item.type;
		
		// add mask as format function
		if (item.mask) {
			item.format = (value) => {
				return apply_mask(item.mask, value);
			}
		} else if ($w(k).onInput) {
			$w(k).maxLength = 200;
		}

		switch (type) {
			case "download":
			case "checkbox":
			case "upload":
			case "button":
				break;
			case "text":
				val = val || "";
				// falls through
			default:
				if (!val && item.hide_on_empty && $w(k).hide)
					$w(k).hide();
				else {
					var new_val = item.format ? item.format(val) : val;
					$w(k)[type] = type == "text" && new_val.toString ? new_val.toString() : new_val;
				}
				break;
		}

		if (item.label)
			$w(k).label = item.label;

		if (item.onChange)
			$w(k).onChange( (event) => { item.onChange(event, val) });
		
		if (item.onClick)
			$w(k).onClick( (event) => { item.onClick(event, val) });

		if (item.format && $w(k).onInput) {
			$w(k).onInput( (event) => {
				if (event.target.value)
					$w(k)[type] = item.format(event.target.value);
			});
		}
	}
}


// -------------- actions functions --------------------
export function utils_show_hide_section(show_list, hide_list) {
    for (let item of hide_list) {
        $w(item).hide && $w(item).hide();
        $w(item).collapse && $w(item).collapse();
    }
    for (let item of show_list) {
        $w(item).expand && $w(item).expand();
        $w(item).show && $w(item).show();
    }
}


// function on 'utils' to be used by 'Extrato' and 'Home' pages
export function utils_set_sections_history(state) {
    switch (state) {
        case SECTION_STATE_LOADING:
            return utils_show_hide_section(["#sectionLoading"], ["#sectionHistData, #sectionNoData"]);
        case SECTION_STATE_DATA:
            return utils_show_hide_section(["#sectionHistData"], ["#sectionLoading, #sectionNoData"]);
        case SECTION_STATE_NO_DATA:
            return utils_show_hide_section(["#sectionNoData"], ["#sectionHistData, #sectionLoading"]);
    }
}

export async function utils_load_history(_is_resumed, _filter) {
    $w("#repeaterHist").onItemReady( ($item, itemData, index) => {
        utils_config_items($item, g_hist_map, itemData);
        utils_set_sections_history(SECTION_STATE_DATA);
    });

	let member = await utils_get_member();
    
    let history = (await be_mod_utils_get_history(_filter, member._id));

	if(_is_resumed)
    	history = history.length >= QTDE_ITENS_RESUMO ? history.slice(0 , QTDE_ITENS_RESUMO) : history; // limits items on resume

    $w("#repeaterHist").data = history; 
    
    if (!history.length)
        utils_set_sections_history(SECTION_STATE_NO_DATA);
}

export function utils_get_elements_values(map_elements) {
	const keys = Object.keys(map_elements);
	const _filter = {};
	
	for (let item of keys){
		_filter[item] = $w(map_elements[item]).value;
	}

	return _filter;
}

export async function utils_get_member() {
	let member = await currentMember.getMember({fieldsets: [ 'FULL' ]});
	return member;
}

export async function  utils_get_saldo() {
	let member = await currentMember.getMember({fieldsets: [ 'FULL' ]});
	let saldo = await be_mod_utils_get_saldo(member._id);

	return saldo;
}


// -------------- internal functions --------------------
function apply_mask(mask, val) {
	if (!val)
		return val;

	function trim_non_digit(res) {
		for (var i = res.length - 1; i >= 0; i--) {
			let char = res[i];
			if (/^\d$/.test(char)) // if digit
				break;
		}
		return res.slice(0, i+1);
	}
	
	val = utils_fmt_strip_non_digits(val);
	let res = mask;
	for (let c of val.toString()) {
		res = res.replace('#', c); // replace first occurence
	}

	res = res.replace(/#/g, '');
	return trim_non_digit(res);
}
