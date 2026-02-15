import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

export default function SettingsScreen() {

    return (

       <View>
        <Text>Settings Screen</Text>
       </View>
    );
}
       
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
        paddingTop: 60,
        paddingHorizontal: 16,
    },  });