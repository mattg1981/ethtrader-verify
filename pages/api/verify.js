import { promises as fs } from 'fs';
import { sql } from "@vercel/postgres";
import moment from "moment";

const dataPath = '/pages/api/verified.json';

async function getData() {
    const data = await fs.readFile(process.cwd() + dataPath, 'utf8')
    return JSON.parse(data)
}

async function saveData(data) {
    await fs.writeFile(process.cwd() + dataPath, JSON.stringify(data, null, "\t"))
}

export default async function handler(req, res) {
    try {
        const {
            query: { w },
            method,
        } = req;

        const forwarded = req.headers["x-forwarded-for"]
        const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress

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

        console.log('here...');

        //const record = data.find(x => x.ip === ip);

        if (!success)  {
            // the ip is found in the file (which means it was verified at some point, but now
            // returns as an invalid ip), so we need to remove this record from the array.

            //if (record != null) {
                await sql`DELETE FROM verfiedwallets where ip_address = '${ip}'`;
                // data = data.filter(x => x.ip !== ip);
                // await saveData(data);
            //}

            res.status(200).send({
                'success': success,
                'reason': reason
            });

            return;
        }

        // at this point, we have a verified ip address, we need to either update the timestamp if the
        // record previously existed or add the new record to the array

        //if (record != null) {
        //    record.timestamp = moment().unix()
           // await sql`UPDATE verfiedwallets set timestamp = ${moment().unix()} where ip_address = ${ip}`;
        //} else {
        //     data.push({
        //         "ip": ip,
        //         "wallet": w,
        //         "timestamp": moment().unix()
        //     })
            await sql`INSERT INTO verfiedwallets(ip_address, wallet, timestamp) Values ('${ip}', '${w}', ${moment().unix()}) on conflict (ip_address) DO UPDATE SET set timestamp = ${moment().unix()}`;
        //}

        //await saveData(data)

        res.status(200).json({
            'success': success,
            'reason': reason
        });
    } catch (error) {
        res.status(500);
    }
}