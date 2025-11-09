package com.quizapp.user_auth_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@Builder
public class PageResponse<T> implements Serializable {
    private int page;       // Số trang hiện tại (bắt đầu từ 0 hoặc 1 tùy BE)
    private int size;       // Kích thước trang
    private long total;     // Tổng số phần tử (số lượng user thực tế)
    private int totalPages; // Tổng số trang
    private boolean hasNext; // Có trang tiếp theo không?
    private boolean hasPrevious; // Có trang trước không?
    private T items;
}
