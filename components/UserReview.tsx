import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from 'lucide-react'

interface UserReviewProps {
  username: string
  avatar: string
  rating: number
  date: string
  comment: string
}

export function UserReview({ username, avatar, rating, date, comment }: UserReviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={avatar} alt={username} />
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{username}</CardTitle>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">{date}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{comment}</p>
      </CardContent>
    </Card>
  )
}

