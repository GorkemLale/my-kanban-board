import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState([]);

    useEffect(() => {
        const fetchtAllBoards = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/boards/');  // amanın await unutma.
                setBoards(response.data.data || []);

            } catch (err) {
                console.error("Board Getirme Hatası", err);
            } finally {  // olmasaydı da olur muydu acaba, sonuçta bu scope'a almadan da setLoading(false); yapabilirdik.
                setLoading(false);
            }
        };

        fetchtAllBoards();
    }, []);

    return (
        <div>
            {boards.map(board => (
                <div  // sade board'ı basamayız çünkü react object'in kendisini render etmeye çalışır ama React object render edemiyor. Sadece primitive değerler yani string, number gibi değerleri render edebilir.
                    key={board.id}
                    style={{color: 'white'}}
                >
                    {board.title}
                </div>
            ))}
        </div>
    );
}

export default HomePage;