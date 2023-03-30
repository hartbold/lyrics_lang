import React, { useState, useEffect  } from 'react';
import { View, TextInput, Button, Text, FlatList, Modal, StyleSheet, StatusBar, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { API_KEY_MUSIXMATCH, API_ENDPOINT_MUSIXMATCH, API_KEY_GOOGLE, API_ENDPOINT_GOOGLE } from '@env';

const App = () => {

  const [inputValue, setInputValue] = useState('');
  const [songList, setSongList] = useState([]);
  const [lyricsModalVisible, setLyricsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {

    setSongList([]);
    setIsLoading(true);

    try {

      const response = await fetch(`${API_ENDPOINT_MUSIXMATCH}track.search?apikey=${API_KEY_MUSIXMATCH}&page_size=10&f_has_lyrics&s_track_rating=desc&q_track_artist=${encodeURIComponent(inputValue)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': "*",
          'Host': "api.musixmatch.com"

        }
      });
      const data = await response.json();
      const trackList = data.message.body.track_list;

      // let cleanTrackList = [];
      trackList.map((obj) => {
        if (obj.track.has_lyrics) {
          setSongList(songList => [...songList, {
            "id": obj.track.track_id,
            "title": obj.track.track_name
          }]);

        }
      });

      setIsLoading(false);

    } catch (error) {
      console.error(error);

      setIsLoading(false);
    }
  };

  const handleSongClick = async song => {

    setIsLoading(true);

    try {

      const response = await fetch(`${API_ENDPOINT_MUSIXMATCH}track.lyrics.get?apikey=${API_KEY_MUSIXMATCH}&track_id=${encodeURIComponent(song.id)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': "*",
          'Host': "api.musixmatch.com"
        }
      });

      const data = await response.json();
      const lyrics = data.message.body.lyrics.lyrics_body;
      const lyrics_html = lyrics.replaceAll("\n", "<br>");

      const tr_response = await fetch(`${API_ENDPOINT_GOOGLE}?q=${lyrics_html}&target=en&source=tr&format=html&key=${API_KEY_GOOGLE}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      const tr_data = await tr_response.json();

      setSelectedSong({ ...song, lyrics: lyrics, tr_lyrics: (tr_data.data.translations[0].translatedText.replaceAll('<br>', "\n").replaceAll('&#39;', "'")) });

      setIsLoading(false);
      setLyricsModalVisible(true);

    } catch (error) {
      console.error(error);

      setIsLoading(false);
    }
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSongClick(item)}>
      <Text key={item.id} style={{ marginBottom: 5, textAlign: 'center' }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const handleInputValueChange = (text) => {
    setInputValue(text);
  };


  useEffect(() => {
    if (inputValue.length > 0) {
      handleSearch();
    } else {
      setSongList([]);
    }
  }, [inputValue]);

  return (
    <View style={styles.container}>
      <TextInput
        style={{ marginTop: 100, textAlign:'center' }}

        onChangeText={handleInputValueChange}
        /*onKeyPress={(event) => {
          if (event.nativeEvent.key === 'Enter') {
            handleSearch();
          }
        }}*/
        value={inputValue}
        placeholder="Enter a group name"
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (

        <FlatList
          style={{ marginTop: 50 }}
          data={songList}
          keyExtractor={item => item.id}
          renderItem={renderSongItem}
        />
      )}
      <Modal visible={lyricsModalVisible}>
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{selectedSong?.title}</Text>
              <View style={styles.modalLyricContainer}>
                <Text style={styles.modalLyrics}>{selectedSong?.lyrics}</Text>
                <Text style={styles.modalLyrics}>{selectedSong?.tr_lyrics}</Text>
              </View>
              <Button title="Close" onPress={() => setLyricsModalVisible(false)} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  modalContainer: {
    padding: 20,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalLyrics: {
    flex: 1,
    paddingBottom: 50,
    padding: 10,
    flexGrow : 1,
  },
  modalLyricContainer: {
    flexDirection:'row'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
