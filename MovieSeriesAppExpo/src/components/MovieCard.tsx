import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface MovieCardProps {
    title: string;
    poster: string;
    opinion: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ title, poster, opinion }) => {
    return (
        <View style={styles.card}>
            <Image source={{ uri: poster }} style={styles.poster} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.opinion}>{opinion}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    poster: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    opinion: {
        fontSize: 14,
        color: '#555',
    },
});

export default MovieCard;