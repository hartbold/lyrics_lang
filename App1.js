import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { API_KEY } from '@env';

const App = () => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = async () => {
    try {
      const response = await fetch(`http://api.musixmatch.com/ws/1.1/track.search?apikey=${API_KEY}&q_artist=${encodeURIComponent(inputValue)}`, {
        // mode: 'no-cors',
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.31.3',
          Accept: 'application/json',
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin" : "*",
          "Host": "api.musixmatch.com"

        }
      });
      const data = await response.json();
      console.log(data.message.body.track_list); // do something with the response data
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{
      flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    }}>
      <TextInput
        value={inputValue}
        onChangeText={text => setInputValue(text)}
        placeholder="Enter some text"
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

export default App;