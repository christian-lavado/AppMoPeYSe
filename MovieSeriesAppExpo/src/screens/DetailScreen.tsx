import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const DetailScreen = () => {
    const route = useRoute();
    const { movie } = route.params;

    return (
        <View style={styles.container}>
            <Image source={{ uri: movie.poster }} style={styles.poster} />
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
            <Text style={styles.opinionTitle}>User Opinions:</Text>
            {movie.opinions.map((opinion, index) => (
                <Text key={index} style={styles.opinion}>{opinion}</Text>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    poster: {
        width: '100%',
        height: 300,
        borderRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    overview: {
        fontSize: 16,
        marginVertical: 4,
    },
    opinionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    opinion: {
        fontSize: 14,
        marginVertical: 2,
    },
});

export default DetailScreen;