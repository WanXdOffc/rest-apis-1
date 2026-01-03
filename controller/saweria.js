const axios = require("axios")
const cheerio = require('cheerio')
const qrcode = require("qrcode")
const moment = require("moment-timezone") 

class Saweria {
   constructor(user_id) {
      this.user_id = user_id
      this.baseUrl = 'https://saweria.co'
      this.apiUrl = 'https://backend.saweria.co'
      this.bPending = '/donations/balance-imv'
      this.bAvailable = '/donations/available-balance'
   }


   createPayment = (amount, msg = 'Order') => {
      return new Promise(async resolve => {
         try {
            if (!this.user_id) return resolve({
               creator: "Arifzyn.",
               status: false,
               msg: 'USER ID NOT FOUND'
            })
            const json = await (await axios.post(this.apiUrl + '/donations/' + this.user_id, {
               agree: true,
               amount: Number(amount),
               customer_info: {
                  first_name: 'Payment Gateway',
                  email: 'iketutdharmawan2007@gmail.com',
                  phone: '',
               },
               message: msg,
               notUnderAge: true,
               payment_type: 'qris',
               vote: ''
            }, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": `${this.baseUrl}/`,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            })).data
            if (!json || !json.data || !json.data.id) return resolve({
               creator: "Darmawan.",
               status: false,
               msg: 'ERROR!'
            })
            resolve({
               creator: "Darmawan.",
               status: true,
               data: {
                  ...json.data,
                  expired_at: moment(json.data.created_at).add(10, 'minutes').format('DD/MM/YYYY HH:mm:ss'),
                  receipt: this.baseUrl + '/qris/' + json.data.id,
                  url: this.baseUrl + '/qris/' + json.data.id,
                  qr_image: await qrcode.toDataURL(json.data.qr_string, {
                     scale: 8
                  })
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: "Arifzyn.",
               status: false,
               msg: e.message
            })
         }
      })
   }

   checkPayment = id => {
      return new Promise(async resolve => {
         try {
            if (!this.user_id) return resolve({
               creator: "Arifzyn.",
               status: false,
               msg: 'USER ID NOT FOUND'
            })
            const html = await (await axios.get(this.baseUrl + '/receipt/' + id, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": this.baseUrl + '/receipt/' + id,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            })).data
            const $ = cheerio.load(html)
            const msg = $('h2[class="chakra-heading css-14dtuui"]').text()
            if (!msg) return resolve({
               creator: "Darmawan.",
               status: false,
                 msg: 'TRANSAKSI TIDAK TERDAFTAR ATAU BELUM TERSELESAIKAN*\n\n*catatan:tolong check status transaksi kamu dengan mengetik check sekali lagi jika yakin telah menyelesaikan transaksi pembayaran'
            })
            const status = msg.toLowerCase() == 'berhasil' ? true : false
            resolve({
               creator: "Darmawan.",
               status,
               msg: msg.toUpperCase()
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: "Darmawan.",
               status: false,
               msg: e.message
            })
         }
      })
   }
}

module.exports = { Saweria }