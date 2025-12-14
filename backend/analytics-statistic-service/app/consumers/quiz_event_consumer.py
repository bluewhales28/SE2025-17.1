def handle_quiz_submitted(event):
    """
    event = {
      quiz_id,
      user_id,
      score,
      topic_breakdown
    }
    """
    # 1. lưu snapshot
    # 2. recompute metrics
    # 3. update analytics_db
