<?php

namespace Database\Seeders;

use App\Models\SalaryCurrency;
use Illuminate\Database\Seeder;

class CreateDefaultCurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $input = [
            [
                'currency_name' => 'USD US Dollar',
                'currency_icon' => '$',
                'currency_code' => 'USD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'EUR Euro',
                'currency_icon' => '€',
                'currency_code' => 'EUR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'HKD Hong Kong Dollar',
                'currency_icon' => '$',
                'currency_code' => 'HKD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'INR Indian Rupee',
                'currency_icon' => '₹',
                'currency_code' => 'INR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'AUD Australian Dollar',
                'currency_icon' => '$',
                'currency_code' => 'AUD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'JMD Jamaican Dollar',
                'currency_icon' => 'J$',
                'currency_code' => 'JMD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'CAD Canadian Dollar',
                'currency_icon' => '$',
                'currency_code' => 'CAD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'AED United Arab Emirates Dirham',
                'currency_icon' => 'د.إ',
                'currency_code' => 'AED',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'AFN Afghanistan Afghani',
                'currency_icon' => '؋',
                'currency_code' => 'AFN',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'ALL Albania Lek',
                'currency_icon' => 'Lek',
                'currency_code' => 'ALL',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'AMD Armenian Dram',
                'currency_icon' => '֏',
                'currency_code' => 'AMD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'ANG Netherlands Antilles Guilder',
                'currency_icon' => 'ƒ',
                'currency_code' => 'ANG',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'AOA Angola kwanza',
                'currency_icon' => 'Kz',
                'currency_code' => 'AOA',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'ARS Argentina Peso',
                'currency_icon' => '$',
                'currency_code' => 'ARS',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'AWG Aruba Guilder',
                'currency_icon' => 'ƒ',
                'currency_code' => 'AWG',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'AZN Azerbaijan Manat',
                'currency_icon' => '₼',
                'currency_code' => 'AZN',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BAM Bosnia and Herzegovina Convertible Marka',
                'currency_icon' => 'KM',
                'currency_code' => 'BAM',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BBD Barbados Dollar',
                'currency_icon' => '$',
                'currency_code' => 'BBD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BDT Bangladesh Taka',
                'currency_icon' => '৳',
                'currency_code' => 'BDT',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BGN Bulgaria Lev',
                'currency_icon' => 'лв',
                'currency_code' => 'BGN',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BMD Bermuda Dollar',
                'currency_icon' => '$',
                'currency_code' => 'BMD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BND Brunei Darussalam Dollar',
                'currency_icon' => '$',
                'currency_code' => 'BND',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BOB Bolivia Boliviano',
                'currency_icon' => '$b',
                'currency_code' => 'BOB',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BRL Brazil Real',
                'currency_icon' => 'R$',
                'currency_code' => 'BRL',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BSD Bahamas Dollar',
                'currency_icon' => '$',
                'currency_code' => 'BSD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BWP Botswana Pula',
                'currency_icon' => 'P',
                'currency_code' => 'BWP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'BZD Belize Dollar',
                'currency_icon' => 'BZ$',
                'currency_code' => 'BZD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'CDF Congo Congolese franc',
                'currency_icon' => 'FC',
                'currency_code' => 'CDF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'CHF Switzerland Franc',
                'currency_icon' => 'CHF',
                'currency_code' => 'CHF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'CNY China Yuan Renminbi',
                'currency_icon' => '¥',
                'currency_code' => 'CNY',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'COP Colombia Peso',
                'currency_icon' => '$',
                'currency_code' => 'COP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'CRC Costa Rica Colon',
                'currency_icon' => '₡',
                'currency_code' => 'CRC',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'CVE Cape Verde Escudo',
                'currency_icon' => '$',
                'currency_code' => 'CVE',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'CZK Czech Republic Koruna',
                'currency_icon' => 'Kč',
                'currency_code' => 'CZK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'DKK Denmark Krone',
                'currency_icon' => 'kr',
                'currency_code' => 'DKK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'DOP Dominican Republic Peso',
                'currency_icon' => 'RD$',
                'currency_code' => 'DOP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'DZD Algeria Dinar',
                'currency_icon' => 'دج',
                'currency_code' => 'DZD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'EGP Egypt Pound',
                'currency_icon' => '£',
                'currency_code' => 'EGP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'ETB Ethiopia Birr',
                'currency_icon' => 'ብር',
                'currency_code' => 'ETB',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'FJD Fiji Dollar',
                'currency_icon' => '$',
                'currency_code' => 'FJD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'FKP Falkland Islands Pound',
                'currency_icon' => '£',
                'currency_code' => 'FKP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'GBP United Kingdom Pound',
                'currency_icon' => '£',
                'currency_code' => 'GBP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'GEL Georgia Lari',
                'currency_icon' => '₾',
                'currency_code' => 'GEL',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'GIP Gibraltar Pound',
                'currency_icon' => '£',
                'currency_code' => 'GIP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'GMD Gambia Dalasi',
                'currency_icon' => 'D',
                'currency_code' => 'GMD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'GTQ Guatemala Quetzal',
                'currency_icon' => 'Q',
                'currency_code' => 'GTQ',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'GYD Guyana Dollar',
                'currency_icon' => '$',
                'currency_code' => 'GYD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'HNL Honduras Lempira',
                'currency_icon' => 'L',
                'currency_code' => 'HNL',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'HRK Croatia Kuna',
                'currency_icon' => 'kn',
                'currency_code' => 'HRK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'HTG Haiti Gourde',
                'currency_icon' => 'G',
                'currency_code' => 'HTG',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'HUF Hungary Forint',
                'currency_icon' => 'Ft',
                'currency_code' => 'HUF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'IDR Indonesia Rupiah',
                'currency_icon' => 'Rp',
                'currency_code' => 'IDR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'ILS Israel Shekel',
                'currency_icon' => '₪',
                'currency_code' => 'ILS',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'ISK Iceland Krona',
                'currency_icon' => 'kr',
                'currency_code' => 'ISK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'KES Kenya Shilling',
                'currency_icon' => '/=',
                'currency_code' => 'KES',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'KGS Kyrgyzstan Som',
                'currency_icon' => 'лв',
                'currency_code' => 'KGS',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'KHR Cambodia Riel',
                'currency_icon' => '៛',
                'currency_code' => 'KHR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'KYD Cayman Dollar',
                'currency_icon' => '$',
                'currency_code' => 'KYD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'KZT Kazakhstan Tenge',
                'currency_icon' => 'лв',
                'currency_code' => 'KZT',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'LAK Laos Kip',
                'currency_icon' => '₭',
                'currency_code' => 'LAK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'LBP Lebanon Pound',
                'currency_icon' => '£',
                'currency_code' => 'LBP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'LKR Sri Lanka Rupee',
                'currency_icon' => '₨',
                'currency_code' => 'LKR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'LRD Liberia Dollar',
                'currency_icon' => '$',
                'currency_code' => 'LRD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'LSL Lesotho Loti',
                'currency_icon' => 'L',
                'currency_code' => 'LSL',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MAD Morocco Dirham',
                'currency_icon' => 'MAD',
                'currency_code' => 'MAD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MDL Moldova Leu',
                'currency_icon' => 'L',
                'currency_code' => 'MDL',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MKD Macedonia Denar',
                'currency_icon' => 'ден',
                'currency_code' => 'MKD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MMK Myanmar Kyat',
                'currency_icon' => 'K',
                'currency_code' => 'MMK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MNT Mongolia Tughrik',
                'currency_icon' => '₮',
                'currency_code' => 'MNT',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MOP Macau P ataca',
                'currency_icon' => 'MOP$',
                'currency_code' => 'MOP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MRO Mauritania Ouguiya',
                'currency_icon' => 'MRU',
                'currency_code' => 'MRO',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MUR Mauritius Rupee',
                'currency_icon' => '₨',
                'currency_code' => 'MUR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MVR Maldives Rufiyaa',
                'currency_icon' => '.ރ',
                'currency_code' => 'MVR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MWK Malawi Kwacha',
                'currency_icon' => 'MK',
                'currency_code' => 'MWK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MXN Mexico Peso',
                'currency_icon' => '$',
                'currency_code' => 'MXN',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MYR Malaysia Ringgit',
                'currency_icon' => 'RM',
                'currency_code' => 'MYR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MZN Mozambique Metical',
                'currency_icon' => 'MT',
                'currency_code' => 'MZN',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'NAD Namibia Dollar',
                'currency_icon' => '$',
                'currency_code' => 'NAD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'NGN Nigeria Naira',
                'currency_icon' => '₦',
                'currency_code' => 'NGN',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'NIO Nicaragua Cordoba',
                'currency_icon' => 'C$',
                'currency_code' => 'NIO',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'NOK Norway Krone',
                'currency_icon' => 'kr',
                'currency_code' => 'NOK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'NPR Nepal Rupee',
                'currency_icon' => '₨',
                'currency_code' => 'NPR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'NZD New Zealand Dollar',
                'currency_icon' => '$',
                'currency_code' => 'NZD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'PAB Panama Balboa',
                'currency_icon' => 'B/.',
                'currency_code' => 'PAB',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'PEN Peru Nuevo Sol',
                'currency_icon' => 'S/.',
                'currency_code' => 'PEN',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'PGK Papua New Guinea Kina',
                'currency_icon' => 'K',
                'currency_code' => 'PGK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'PHP Philippines Peso',
                'currency_icon' => '₱',
                'currency_code' => 'PHP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'PKR Pakistan Rupee',
                'currency_icon' => '₨',
                'currency_code' => 'PKR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'PLN Poland Zloty',
                'currency_icon' => 'zł',
                'currency_code' => 'PLN',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'QAR Qatar Riyal',
                'currency_icon' => '﷼',
                'currency_code' => 'QAR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'RON Romania New Leu',
                'currency_icon' => 'lei',
                'currency_code' => 'RON',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'RSD Serbia Dinar',
                'currency_icon' => 'Дин.',
                'currency_code' => 'RSD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'RUB Russia Ruble',
                'currency_icon' => '₽',
                'currency_code' => 'RUB',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SAR Saudi Arabia Riyal',
                'currency_icon' => '﷼',
                'currency_code' => 'SAR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SBD Solomon Islands Dollar',
                'currency_icon' => '$',
                'currency_code' => 'SBD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SCR Seychelles Rupee',
                'currency_icon' => '₨',
                'currency_code' => 'SCR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SEK Sweden Krona',
                'currency_icon' => 'kr',
                'currency_code' => 'SEK',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SGD Singapore Dollar',
                'currency_icon' => '$',
                'currency_code' => 'SGD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SHP Saint Helena Pound',
                'currency_icon' => '£',
                'currency_code' => 'SHP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SLL Sierra Leone Leone',
                'currency_icon' => 'Le',
                'currency_code' => 'SLL',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SOS Somalia Shilling',
                'currency_icon' => 'S',
                'currency_code' => 'SOS',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SRD Suriname Dollar',
                'currency_icon' => '$',
                'currency_code' => 'SRD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'STD São Tomé and Príncipe Dobra',
                'currency_icon' => 'Db',
                'currency_code' => 'STD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'SZL Eswatini lilangeni',
                'currency_icon' => 'L',
                'currency_code' => 'SZL',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'THB Thailand Baht',
                'currency_icon' => '฿',
                'currency_code' => 'THB',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'TJS Tajikistan Somoni',
                'currency_icon' => 'ЅM',
                'currency_code' => 'TJS',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'TOP Tonga Pa’anga',
                'currency_icon' => 'T$',
                'currency_code' => 'TOP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'TRY Turkey Lira',
                'currency_icon' => '₺',
                'currency_code' => 'TRY',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'TTD Trinidad and Tobago Dollar',
                'currency_icon' => 'TT$',
                'currency_code' => 'TTD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'TWD Taiwan New Dollar',
                'currency_icon' => 'NT$',
                'currency_code' => 'TWD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'TZS Tanzania Shiling',
                'currency_icon' => 'TSh',
                'currency_code' => 'TZS',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'UAH Ukraine Hryvna',
                'currency_icon' => '₴',
                'currency_code' => 'UAH',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'UYU Uruguay Peso',
                'currency_icon' => '$U',
                'currency_code' => 'UYU',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'UZS Uzbekistan Som',
                'currency_icon' => 'лв',
                'currency_code' => 'UZS',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'WST Samoa  Tālā',
                'currency_icon' => 'WS$',
                'currency_code' => 'WST',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'XCD Eastern Caribbean States Dollar',
                'currency_icon' => '$',
                'currency_code' => 'XCD',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'YER Yemen Rial',
                'currency_icon' => '﷼',
                'currency_code' => 'YER',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'ZAR South Africa Rand',
                'currency_icon' => 'R',
                'currency_code' => 'ZAR',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'ZMW Zambia Kwacha',
                'currency_icon' => 'ZK',
                'currency_code' => 'ZMW',
                'is_default'    => 1,
            ],
            //Zero Decimal Currencies
            [
                'currency_name' => 'BIF Burundi Franc',
                'currency_icon' => 'FBu',
                'currency_code' => 'BIF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'CLP Chile Peso',
                'currency_icon' => '$',
                'currency_code' => 'CLP',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'DJF Djibouti Franc',
                'currency_icon' => 'Fdj',
                'currency_code' => 'DJF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'GNF Guinea Franc',
                'currency_icon' => 'GFr',
                'currency_code' => 'GNF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'JPY Japan Yen',
                'currency_icon' => '¥',
                'currency_code' => 'JPY',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'KMF Comoros Franc',
                'currency_icon' => 'CF',
                'currency_code' => 'KMF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'KRW Korea Won',
                'currency_icon' => '₩',
                'currency_code' => 'KRW',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'MGA Madagascar Ariary ',
                'currency_icon' => 'Ar',
                'currency_code' => 'MGA',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'PYG Paraguay Guarani',
                'currency_icon' => 'Gs',
                'currency_code' => 'PYG',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'RWF Rwanda Franc',
                'currency_icon' => 'R₣',
                'currency_code' => 'RWF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'UGX Uganda Shilling',
                'currency_icon' => 'USh',
                'currency_code' => 'UGX',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'VND Viet Nam Dong',
                'currency_icon' => '₫',
                'currency_code' => 'VND',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'VUV Vanuatu Vatu',
                'currency_icon' => 'VT',
                'currency_code' => 'VUV',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'XAF Central Africa Central African CFA Franc',
                'currency_icon' => 'FCFA',
                'currency_code' => 'XAF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'XOF West Africa West African CFA Franc',
                'currency_icon' => 'CFA',
                'currency_code' => 'XOF',
                'is_default'    => 1,
            ],
            [
                'currency_name' => 'XPF France Franc',
                'currency_icon' => '₣',
                'currency_code' => 'XPF',
                'is_default'    => 1,
            ],
        ];

        $salaryCurrencies = [
            'USD US Dollar',
            'EUR Euro',
            'HKD Hong Kong Dollar',
            'INR Indian Rupee',
            'AUD Australian Dollar',
            'JMD Jamaican Dollar',
            'CAD Canadian Dollar',
        ];

        foreach ($input as $data) {
            if (in_array($data['currency_name'], $salaryCurrencies)) {
                $salaryCurrency = SalaryCurrency::whereCurrencyName($data['currency_name'])->first();
                if ($salaryCurrency != null) {
                    $salaryCurrency->update([
                        'currency_icon' => $data['currency_icon'], 'currency_code' => $data['currency_code'],
                    ]);
                }
            } else {
                SalaryCurrency::create($data);
            }
        }
    }
}
