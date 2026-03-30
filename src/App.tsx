import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const App = () => {
  const history = useHistory();

  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      // Logic to determine if path is an article or not
      const isArticlePath = path.startsWith('/article/');
      
      // Handle 404 redirect
      if (!isArticlePath) {
        history.push('/404');
      }
      // Implement article parsing logic
    };

    handleRouting();
  }, [history]);
  
  return (
    <div>
      {/* Other components */}
    </div>
  );
};

export default App;