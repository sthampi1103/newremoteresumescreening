import {ArrowRight, Check, ChevronsUpDown, Circle, Copy, Edit, ExternalLink, File, HelpCircle, Home, Loader2, Mail, MessageSquare, Moon, Plus, PlusCircle, Search, Server, Settings, Share2, Shield, Sun, Trash, User, X, Workflow, FileUp, Loader, AlertCircle, FileText, Play, RefreshCw, Wand } from 'lucide-react'; // Added Play, RefreshCw (for reset), Wand

const Icons = {
  arrowRight: ArrowRight,
  check: Check,
  chevronDown: ChevronsUpDown, // Renamed from chevronUpDown for consistency
  circle: Circle,
  workflow: Workflow,
  close: X,
  copy: Copy,
  dark: Moon,
  edit: Edit,
  externalLink: ExternalLink,
  file: File,
  help: HelpCircle,
  home: Home,
  light: Sun,
  loader: Loader2, // Using Loader2 as spinner
  mail: Mail,
  messageSquare: MessageSquare,
  plus: Plus,
  plusCircle: PlusCircle,
  search: Search,
  server: Server,
  settings: Settings,
  share: Share2,
  shield: Shield,
  spinner: Loader2, // Consistent spinner
  trash: Trash,
  user: User,
  fileUpload: FileUp,
  alertCircle: AlertCircle,
  fileText: FileText,
  play: Play, // Added Play icon
  refresh: RefreshCw, // Added RefreshCw icon (alias as refresh)
  wand: Wand, // Added Wand icon for Generate Questions
};

export {Icons};
