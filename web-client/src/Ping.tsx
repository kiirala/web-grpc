import { useEffect, useState } from 'react';
import { PingResponse } from './proto/ping';

const Ping = () => {
  const [message, setMessage] = useState<string>('Hello');
  const [response, setResponse] = useState<PingResponse>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setError('');
    const params = new URLSearchParams({ message });
    fetch(`/api/v1/ping?${params.toString()}`, { method: 'GET' }).then(
      (reply) => {
        if (!reply.ok) {
          setError(`Received error ${reply.statusText}`);
          return;
        }
        reply.json().then((json) => {
          const content = PingResponse.fromJSON(json);
          setResponse(content);
        });
      },
      (error) => {
        setError(`Failed to fetch data: ${error.toString()}`);
      }
    );
  }, [message]);

  return (
    <div className="card">
      <p>Ping the server</p>
      <input onChange={(ev) => setMessage(ev.target.value)} value={message} />
      <p>
        {response && (
          <>
            Server time was {response.serverTime?.toString()} and our message was {}
            {response.messageLength} characters long
          </>
        )}
        {error && <>{error}</>}
        &nbsp;
      </p>
    </div>
  );
};

export default Ping;
