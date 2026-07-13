import { useEffect, useState } from "react"

export const ApplicationCard = () => {

    const [data, setData] = useState([]);

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/applications');

                if(!response.ok) {
                    throw new Error('I can not fetch data');
                }

                const result = await response.json();
                setData(result);
            }catch(e) {
                console.log(e);
            }
        }
        fetchData();
    })
    return (
        <ul>
            {data.map(application => (
                <li key={application}>{application}</li>
            ))}
        </ul>
    )
}