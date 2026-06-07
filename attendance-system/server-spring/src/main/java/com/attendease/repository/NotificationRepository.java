package com.attendease.repository;

import com.attendease.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByRecipientId(Long recipientId);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(@Param("recipientId") Long recipientId);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId AND n.isRead = false")
    List<Notification> findUnreadByRecipientId(@Param("recipientId") Long recipientId);
    
    List<Notification> findByRecipientIdAndType(Long recipientId, String type);
}
