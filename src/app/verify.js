import {useSearchParams} from "next/navigation";
import {useState} from "react";

async function verifyIp(wallet) {
    return await fetch(`/ethtrader-verify/api/verify?w=${wallet}`)
        .then((res) => res.json());
}

export default function Verify() {

    const searchParams = useSearchParams();
    const [wallet, setWallet] = useState(searchParams.get('w'));
    const [result, setResult] = useState(null);
    const [inactive, setInactive] = useState(false);

    return <div>
        <h1>Verify Account</h1>
        <span className="">
          Wallet: {wallet}
        </span>
        <button disabled={inactive}
                className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
                onClick={async () => {
                    setInactive(true)
                    const result = await verifyIp(searchParams.get('w'));
                    setInactive(false);
                    setResult(JSON.stringify(result));
                }}>Verify
        </button>
        <div>
            <span>{result}</span>
        </div>
    </div>
}