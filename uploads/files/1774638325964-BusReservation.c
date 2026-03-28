#include <stdio.h>

#define TOTAL_SEATS 20

int main() {
    int seats[TOTAL_SEATS] = {0}; // 0 = available
    int choice, seatNo;

    do {
        printf("\n===== BUS RESERVATION SYSTEM =====\n");
        printf("1. Show Seat Status\n");
        printf("2. Book Seat\n");
        printf("3. Cancel Seat\n");
        printf("4. Exit\n");
        printf("Enter choice: ");
        scanf("%d", &choice);

        switch (choice) {

        case 1:
            printf("\n--- Seat Status ---\n");
            for (int i = 0; i < TOTAL_SEATS; i++) {
                printf("Seat %d: %s\n", i + 1, 
                    seats[i] == 0 ? "Available" : "Booked");
            }
            break;

        case 2:
            printf("Enter seat number to book (1-20): ");
            scanf("%d", &seatNo);

            if (seatNo < 1 || seatNo > TOTAL_SEATS) {
                printf(" Invalid seat number!\n");
            } else if (seats[seatNo - 1] == 1) {
                printf(" Seat already booked!\n");
            } else {
                seats[seatNo - 1] = 1;
                printf(" Seat booked successfully!\n");
            }
            break;

        case 3:
            printf("Enter seat number to cancel (1-20): ");
            scanf("%d", &seatNo);

            if (seatNo < 1 || seatNo > TOTAL_SEATS) {
                printf(" Invalid seat number!\n");
            } else if (seats[seatNo - 1] == 0) {
                printf(" Seat already available!\n");
            } else {
                seats[seatNo - 1] = 0;
                printf(" Seat cancelled successfully!\n");
            }
            break;

        case 4:
            printf("Exiting...\n");
            break;

        default:
            printf("Enter valid choice!\n");
        }

    } while (choice != 4);

    return 0;
}