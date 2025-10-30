export const vi = {
  // Common
  common: {
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Sửa',
    add: 'Thêm',
    close: 'Đóng',
    confirm: 'Xác nhận',
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',
    search: 'Tìm kiếm',
    filter: 'Lọc',
    sort: 'Sắp xếp',
    view: 'Xem',
    settings: 'Cài đặt',
  },

  // Auth
  auth: {
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    signup: 'Đăng ký',
    email: 'Email',
    password: 'Mật khẩu',
    username: 'Tên người dùng',
    forgotPassword: 'Quên mật khẩu?',
    rememberMe: 'Ghi nhớ đăng nhập',
    welcomeBack: 'Chào mừng trở lại',
    createAccount: 'Tạo tài khoản',
  },

  // Sidebar
  sidebar: {
    dashboard: 'Tổng quan',
    calendar: 'Lịch làm việc',
    habits: 'Thói quen',
    quests: 'Nhiệm vụ',
    shop: 'Cửa hàng',
    inventory: 'Kho đồ',
    settings: 'Cài đặt',
  },

  // Dashboard
  dashboard: {
    title: 'Chào mừng trở lại, {username}!',
    subtitle: 'Đây là tổng quan năng suất của bạn hôm nay.',
    tasksCompletedToday: 'Công việc hoàn thành hôm nay',
    habitSuccessRate: 'Tỷ lệ hoàn thành thói quen',
    rewardPoints: 'Điểm thưởng',
    weeklyProductivity: 'Năng suất tuần',
    todaysAgenda: 'Lịch trình hôm nay',
    noAgenda: 'Lịch trình của bạn trống. Tận hưởng sự yên bình!',
    allDay: 'Cả ngày',
  },

  // Calendar/Todos
  calendar: {
    title: 'Lịch làm việc của tôi',
    newTask: 'Công việc mới',
    addTask: 'Thêm công việc',
    viewMode: {
      list: 'Danh sách',
      grid: 'Lưới',
      week: 'Tuần',
      month: 'Tháng',
    },
    days: {
      sun: 'CN',
      mon: 'T2',
      tue: 'T3',
      wed: 'T4',
      thu: 'T5',
      fri: 'T6',
      sat: 'T7',
    },
    daysLong: {
      sunday: 'Chủ nhật',
      monday: 'Thứ hai',
      tuesday: 'Thứ ba',
      wednesday: 'Thứ tư',
      thursday: 'Thứ năm',
      friday: 'Thứ sáu',
      saturday: 'Thứ bảy',
    },
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    tomorrow: 'Ngày mai',
    thisWeek: 'Tuần này',
    nextWeek: 'Tuần sau',
    daysCount: '{count} ngày',
  },

  // Add Task Modal
  addTask: {
    title: 'Thêm công việc mới',
    editTitle: 'Chỉnh sửa công việc',
    taskName: 'Tên công việc',
    taskPlaceholder: 'Cần làm gì?',
    description: 'Mô tả (Tùy chọn)',
    descriptionPlaceholder: 'Thêm chi tiết...',
    dueDate: 'Ngày hết hạn',
    startTime: 'Giờ bắt đầu',
    endTime: 'Giờ kết thúc',
    priority: 'Độ ưu tiên',
    priorityLow: 'Thấp',
    priorityMedium: 'Trung bình',
    priorityHigh: 'Cao',
    attachments: 'Tệp đính kèm',
    uploadFile: 'Tải lên tệp',
    uploadImage: 'Tải lên ảnh',
    rewards: 'Phần thưởng',
    penalties: 'Hình phạt',
    points: 'điểm',
    creating: 'Đang tạo...',
    updating: 'Đang cập nhật...',
    create: 'Tạo công việc',
    update: 'Cập nhật',
    deleteConfirm: 'Xóa công việc "{task}"?',
    validations: {
      nameRequired: 'Tên công việc là bắt buộc',
      endTimeAfterStart: 'Giờ kết thúc phải sau giờ bắt đầu',
    },
  },

  // Habits
  habits: {
    title: 'Theo dõi thói quen',
    newHabit: 'Thói quen mới',
    myHabits: 'Thói quen của tôi',
    stats: {
      totalHabits: 'Tổng số thói quen',
      completedToday: 'Hoàn thành hôm nay',
      currentStreak: 'Chuỗi hiện tại',
      longestStreak: 'Chuỗi dài nhất',
      days: 'ngày',
    },
    categories: {
      mind: 'Trí tuệ',
      body: 'Thể chất',
      spirit: 'Tinh thần',
      productivity: 'Năng suất',
    },
    createModal: {
      title: 'Tạo thói quen mới',
      name: 'Tên thói quen',
      namePlaceholder: 'VD: Thiền định buổi sáng',
      chooseIcon: 'Chọn biểu tượng',
      category: 'Danh mục',
      goal: 'Mục tiêu',
      goalPlaceholder: 'VD: Thiền 10 phút mỗi ngày',
      creating: 'Đang tạo...',
      create: 'Tạo thói quen',
      validations: {
        nameRequired: 'Tên thói quen là bắt buộc',
        goalRequired: 'Mục tiêu là bắt buộc',
      },
    },
    streak: 'Chuỗi',
    completionRate: 'Tỷ lệ hoàn thành',
    markComplete: 'Đánh dấu hoàn thành',
  },

  // Quests
  quests: {
    title: 'Bảng nhiệm vụ',
    mainStory: 'Nhiệm vụ chính',
    sideMissions: 'Nhiệm vụ phụ',
    progress: 'Tiến độ',
    rewards: 'Phần thưởng',
    xp: 'KN', // Kinh nghiệm
    points: 'Điểm',
    claimReward: 'Nhận thưởng',
    inProgress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    locked: 'Khóa',
    noMainQuests: 'Chưa có nhiệm vụ chính. Hãy quay lại sau!',
    noSideQuests: 'Chưa có nhiệm vụ phụ. Hãy quay lại sau!',
    aiGenerated: 'Được tạo bởi AI',
    personalizedFor: 'Được cá nhân hóa cho bạn',
  },

  // Shop
  shop: {
    title: 'Cửa hàng phần thưởng',
    yourPoints: 'Điểm của bạn',
    claimReward: 'Nhận phần thưởng',
    notEnoughPoints: 'Không đủ điểm',
    processing: 'Đang xử lý...',
    purchaseSuccess: 'Bạn đã nhận "{name}"! Tận hưởng phần thưởng!',
    purchaseError: 'Lỗi: {error}',
    inventory: 'Kho đồ của tôi',
    myRewards: 'Phần thưởng của tôi',
    useReward: 'Sử dụng',
    rewardUsed: 'Đã sử dụng',
    rewardExpired: 'Đã hết hạn',
    expiresIn: 'Hết hạn sau {days} ngày',
    noRewards: 'Bạn chưa có phần thưởng nào',
    categories: {
      all: 'Tất cả',
      relax: 'Thư giãn',
      focus: 'Tập trung',
      joy: 'Vui vẻ',
      growth: 'Phát triển',
    },
  },

  // Settings
  settings: {
    title: 'Cài đặt',
    profile: 'Hồ sơ',
    account: 'Tài khoản',
    preferences: 'Tùy chọn',
    notifications: 'Thông báo',
    language: 'Ngôn ngữ',
    theme: 'Giao diện',
    privacy: 'Quyền riêng tư',
    about: 'Về ứng dụng',
    editProfile: 'Chỉnh sửa hồ sơ',
    changeAvatar: 'Đổi ảnh đại diện',
    changePassword: 'Đổi mật khẩu',
    deleteAccount: 'Xóa tài khoản',
    save: 'Lưu thay đổi',
    saved: 'Đã lưu!',
  },

  // AI Assistant
  ai: {
    title: 'Trợ lý AI',
    placeholder: 'Hỏi gì đó...',
    send: 'Gửi',
    thinking: 'Đang suy nghĩ...',
    error: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    suggestions: [
      'Tạo kế hoạch học tập cho tôi',
      'Gợi ý thói quen tốt',
      'Phân tích năng suất của tôi',
      'Tạo nhiệm vụ cá nhân hóa',
    ],
  },

  // Notifications
  notifications: {
    taskCompleted: 'Hoàn thành công việc! +{points} điểm',
    habitCompleted: 'Hoàn thành thói quen! +{points} điểm',
    questCompleted: 'Hoàn thành nhiệm vụ! +{xp} KN, +{points} điểm',
    levelUp: 'Lên cấp {level}! 🎉',
    streakAchieved: 'Đạt chuỗi {days} ngày! 🔥',
  },

  // Errors
  errors: {
    generic: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    network: 'Lỗi kết nối mạng',
    unauthorized: 'Bạn cần đăng nhập để thực hiện hành động này',
    notFound: 'Không tìm thấy',
    validation: 'Dữ liệu không hợp lệ',
  },
};

export type TranslationKeys = typeof vi;
