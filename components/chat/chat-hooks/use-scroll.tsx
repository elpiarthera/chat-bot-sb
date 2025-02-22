import { ChatbotUIContext } from "@/context/context"
import {
  type UIEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react"

export const useScroll = () => {
  const { isGenerating, chatMessages } = useContext(ChatbotUIContext)

  const messagesStartRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAutoScrolling = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [isAtTop, setIsAtTop] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const scrollToBottom = useCallback(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    scrollElement.scrollTop = scrollElement.scrollHeight
  }, [])

  const scrollToTop = useCallback(() => {
    if (messagesStartRef.current) {
      messagesStartRef.current.scrollIntoView({ behavior: "instant" })
    }
  }, [])

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement
    if (!target) return

    const isBottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <
      10

    setIsAtBottom(isBottom)
    setUserScrolled(!isBottom)
  }, [])

  useEffect(() => {
    setUserScrolled(false)

    if (!isGenerating && userScrolled) {
      setUserScrolled(false)
    }
  }, [isGenerating, userScrolled])

  useEffect(() => {
    if (isGenerating && !userScrolled) {
      scrollToBottom()
    }
  }, [isGenerating, userScrolled, scrollToBottom])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const scrollHandler = (event: Event) => handleScroll(event)
    scrollElement.addEventListener("scroll", scrollHandler)
    return () => scrollElement.removeEventListener("scroll", scrollHandler)
  }, [handleScroll])

  useEffect(() => {
    if (!isGenerating && !userScrolled) {
      scrollToBottom()
    }
  }, [isGenerating, userScrolled, scrollToBottom])

  return {
    messagesStartRef,
    messagesEndRef,
    isAtTop,
    isAtBottom,
    userScrolled,
    isOverflowing,
    handleScroll,
    scrollToTop,
    scrollToBottom,
    setIsAtBottom,
    setUserScrolled,
    scrollRef
  }
}
