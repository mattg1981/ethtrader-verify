import { sql } from "@vercel/postgres";
import moment from "moment";

const dataPath = '/pages/api/verified.json';

export default async function handler(req, res) {
    try {
        const {
            query: { w },
            method,
        } = req;

        console.log('here...');

        const forwarded = req.headers["x-forwarded-for"]
        //const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress

        const ip = '99.48.231.144'


        const ipapiResult = await fetch(`https://api.ipapi.is/?q=${ip}&key=${process.env.NEXT_PUBLIC_API_KEY}`)
            .then((res) => res.json())

        const {
            is_bogon,
            is_datacenter,
            is_tor,
            is_proxy,
            is_vpn,
            is_abuser
        } = ipapiResult;

        let success = true;
        let reason = null;

        if (is_bogon) {
            success = false;
            reason = 'bogon'
        }

        if (is_datacenter) {
            success = false;
            reason = 'datacenter'
        }

        if (is_tor) {
            success = false;
            reason = 'tor'
        }

        if (is_proxy) {
            success = false;
            reason = 'proxy'
        }

        if (is_vpn) {
            success = false;
            reason = 'vpn'
        }

        if (is_abuser) {
            success = false;
            reason = 'abuser'
        }

        if (!success)  {
            // the ip is found in the file (which means it was verified at some point, but now
            // returns as an invalid ip), so we need to remove this record from the array.

            await sql`
                DELETE FROM verifiedwallets where ip_address=${ip}
            `;

            res.status(200).send({
                'success': success,
                'reason': reason
            });

            return;
        }

        // at this point, we have a verified ip address, we need to either update the timestamp if the
        // record previously existed or add the new record to the array

        const {rows} = await sql`SELECT id from verifiedwallets where ip_address=${ip}`;

        if (rows.length > 0) {
            await sql`UPDATE verifiedwallets SET timestamp=${moment().unix()} WHERE ip_address=${ip}`;
        } else {
            await sql`INSERT INTO verifiedwallets (ip_address, wallet, timestamp) VALUES (${ip},${w},${moment().unix()})`;
        }

        res.status(200).json({
            'success': success,
            'reason': reason
        });
    } catch (error) {
        res.status(500);
    }
}