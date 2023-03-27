import React, { useState } from 'react';
import { View, TextInput, Button, Text, FlatList, Modal, StyleSheet, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { API_KEY, API_ENDPOINT } from '@env';

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [songList, setSongList] = useState([]);
  const [lyricsModalVisible, setLyricsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const handleSearch = async () => {

    setSongList([]);

    try {

      console.log("handleSearch:fetch");

      const response = await fetch(`${API_ENDPOINT}track.search?apikey=${API_KEY}&page_size=10&f_has_lyrics&s_track_rating=desc&q_track_artist=${encodeURIComponent(inputValue)}`, {
        // mode: 'no-cors',
        method: 'GET',
        headers: {
          // 'User-Agent': 'PostmanRuntime/7.31.3',
          Accept: 'application/json',
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
          "Host": "api.musixmatch.com"

        }
      });
      const data = await response.json().then(console.log("handleSearch:done"));
      const trackList = data.message.body.track_list;

      // let cleanTrackList = [];
      trackList.map((obj) => {
        console.log(obj.track.track_name);
        if (obj.track.has_lyrics) {


          setSongList(songList => [...songList, {
            "id": obj.track.track_id,
            "title": obj.track.track_name
          }]);

        }
      });

    } catch (error) {
      console.error(error);
    }
  };

  const handleSongClick = async song => {
    try {
      console.log("handleSongClick:fetch");

      const response = await fetch(`${API_ENDPOINT}track.lyrics.get?apikey=${API_KEY}&track_id=${encodeURIComponent(song.id)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
          "Host": "api.musixmatch.com"
        }
      });
      ;

      const data = await response.json().then(console.log("handleSongClick:done"));
      setSelectedSong({ ...song, lyrics: data.message.body.lyrics.lyrics_body });
      setLyricsModalVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const renderSongItem = ({ item }) => (
    <Text key={item.id} onPress={() => handleSongClick(item)} style={{ marginBottom: 5, textAlign: 'center' }}>
      {item.title}
    </Text>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={{ marginTop: 100 }}
        value={inputValue}
        onChangeText={text => setInputValue(text)}
        placeholder="Enter a group name"
      />
      <Button style={styles.button} title="Search" onPress={handleSearch} />
      <FlatList
        style={{ marginTop: 50 }}
        data={songList}
        keyExtractor={item => item.id}
        renderItem={renderSongItem}
      />
      <Modal visible={lyricsModalVisible}>
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{selectedSong?.title}</Text>
              <Text style={styles.modalLyrics}>{selectedSong?.lyrics}</Text>
              <Button title="Close" onPress={() => setLyricsModalVisible(false)} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fabada"
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    marginHorizontal: 20,
  },
  modalContainer: {
    padding: 0,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalLyrics: {
    textAlign: 'center',
  },
});

export default App;
