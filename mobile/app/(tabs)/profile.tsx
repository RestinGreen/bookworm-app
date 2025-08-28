import { View, Text, Alert, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import BASE_URL from '@/constants/url'
import { useAuthStore } from '@/store/authStore'
import styles from '@/assets/styles/profile.styles'
import ProfileHeader from '@/components/ProfileHeader'
import LogoutButton from '@/components/LogoutButton'
import { Book } from '@/models/Book'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '@/constants/colors'
import { Image } from 'expo-image'
import Loader from '@/components/Loader'


export default function Profile() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null)

  const router = useRouter();

  const { token } = useAuthStore();

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_URL}/api/books/user`, {
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user books');
      }
      setBooks(data)
    } catch (error) {
      console.error("Error fetching user books:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "An error occurred while fetching your books. Please try again.");
    } finally {
      setIsLoading(false)
    }

  }

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#f4b400' : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars
  }

  const handleDeleteBook = async (bookid: string) => {
    try {
      setDeleteBookId(bookid)
      const response = await fetch(`${BASE_URL}/api/books/${bookid}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        }
      })
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete book');
      }
      setBooks(books.filter((book) => book._id !== bookid));
      Alert.alert("Success", "Book deleted successfully");

    } catch (error) {
      console.log("Error deleting book:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "An error occurred while deleting the book. Please try again.");
    } finally {
      setDeleteBookId(null)
    }
  }

  const confirmDelete = (bookid: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this book?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => handleDeleteBook(bookid),
          style: "destructive"
        }
      ]
    );
  }

  const renderBookItem = ({ item }: { item: Book }) => (
    <View style={styles.bookItem}>
      <Image source={item.image} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.bookCaption} numberOfLines={2}>{item.caption}</Text>
        <Text style={styles.bookDate}>Posted on {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
        {deleteBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name='trash-outline' size={20} color={COLORS.primary} />

        )}
      </TouchableOpacity>
    </View>
  )

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  if(isLoading && !isRefreshing) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>My Books</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        ListEmptyComponent={
          <View>
            <Ionicons name='book-outline' size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No books yet.</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/create')}>
              <Text style={styles.addButtonText}>Add your first book</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }

      />

    </View>
  )
}