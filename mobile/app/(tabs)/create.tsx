import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import styles from '@/assets/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '@/store/authStore';
import BASE_URL from '@/constants/url';

export default function Create() {


    const [title, setTitle] = React.useState('');
    const [caption, setCaption] = React.useState('');
    const [rating, setRating] = React.useState(3);
    const [image, setImage] = React.useState('');
    const [imageBase64, setImageBase64] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    const { token } = useAuthStore();

    const router = useRouter();

    const pickImage = async () => {

        try {
            if (Platform.OS !== "web") {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission required", "Please grant camera roll permissions");
                    return;
                }
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true
            })
            if (!result.canceled) {
                setImage(result.assets[0].uri);

                if (result.assets[0].base64) {
                    setImageBase64(result.assets[0].base64);
                } else {
                    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
                    setImageBase64(base64);
                }
            }
        } catch (error) {
            console.log("Error picking image:", error);
            Alert.alert("Error", "An error occurred while picking the image. Please try again.");
        }
    }

    const handleSubmit = async () => {

        if (!title || !caption || !image || !rating) {
            Alert.alert("Validation Error", "Please fill all the fields and select an image.");
            return
        }
        try {
            setLoading(true);

            const uriParts = image.split('.');
            const fileType = uriParts[uriParts.length - 1];
            const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg"
            const imageDataUrl = `data:${imageType};base64,${imageBase64}`

            const response = await fetch(`${BASE_URL}/api/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    caption,
                    rating,
                    image: imageDataUrl
                })
            })
            const data = await response.json();
            console.log("data ", data)
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create post');
            }
            Alert.alert("Success", "Your book post has been created");
            setTitle('');
            setCaption('');
            setRating(3);
            setImage('');
            setImageBase64(null);

        } catch (error) {
            console.log("Error submitting post:", error);
            Alert.alert("Error", error instanceof Error ? error.message : "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const renderRatingPicker = () => {
        const start = [];
        for (let i = 1; i <= 5; i++) {
            start.push(
                <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
                    <Ionicons
                        name={i <= rating ? "star" : "star-outline"}
                        size={32}
                        color={i <= rating ? "#f4b400" : COLORS.textSecondary}
                    />
                </TouchableOpacity>
            )
        }
        return (
            <View style={styles.ratingContainer}>
                {start}
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

            <ScrollView style={styles.scrollViewStyle} contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    {/* header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Post</Text>
                        <Text style={styles.subtitle}>Share your favorite books</Text>
                    </View>

                    <View style={styles.form}>
                        {/* book title */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Book Title</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="book-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter book title"
                                    placeholderTextColor={COLORS.placeholderText}
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>
                        </View>
                        {/* rating */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Rating</Text>
                            {renderRatingPicker()}
                        </View>
                        {/* image */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Image</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.placeholderContainer}>
                                        <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                                        <Text style={styles.placeholderText}>Tap to change image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        {/* caption */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Caption</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Write your review about this book."
                                placeholderTextColor={COLORS.placeholderText}
                                value={caption}
                                onChangeText={setCaption}
                                multiline
                            />
                        </View>
                        {/* button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <>
                                    <Ionicons name='cloud-upload-outline' size={20} color={COLORS.white} style={styles.buttonIcon} />
                                    <Text style={styles.buttonText}>Upload</Text>
                                </>
                            )}

                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}