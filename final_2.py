#%% Ho
#%% imports
import cv2
from skimage.feature import register_translation
from skimage import registration
import shutil
import numpy as np
#%% initialization
x_on_wsi = 128
y_on_wsi = 128
x_on_image_low_resolution = np.int32((x_on_wsi // 8) + 127)
y_on_image_low_resolution = np.int32((y_on_wsi // 8) + 127)
window_before = np.zeros((256,256,3), dtype='uint8')  
status = 0
correction_stat = 1
#%%configuration of camera
index = 1
arr = []
while True:
    cap = cv2.VideoCapture(index)
    if not(cap.isOpened()):
        break
    else:
        arr.append(index)
        cap.release()
        index += 1
for index in arr:
    print(index)
index = 0
cap = cv2.VideoCapture(index)
i = 1
start_time, end_time = 0, 0
#%% windows of view
cv2.namedWindow('field_of_view', cv2.WINDOW_NORMAL)
cv2.resizeWindow('field_of_view', 256, 256)
cv2.namedWindow('image_low_resolution', cv2.WINDOW_NORMAL)
cv2.resizeWindow('image_low_resolution', 256, 256)
cv2.namedWindow('test', cv2.WINDOW_NORMAL)
cv2.resizeWindow('test', 256, 256)
#%% low resolution image 
image_low_resolution = np.uint8(np.zeros((256, 256, 3)))
#%% white blank images
for i in range(-10, 11):
    for j in range(-10, 11):
        original = r'img.jpeg'
        target = f'{i}_{j}.jpeg'
        shutil.copyfile(original, target)
#%% calculate field_of_view
x_fov = 210
y_fov = 210
r_fov = 128
#%% read, show, write first image
x_edge_on_wsi = x_on_wsi - 128
y_edge_on_wsi = y_on_wsi - 128
x_edge_on_own_pic = np.int32(x_edge_on_wsi % 256)
y_edge_on_own_pic = np.int32(y_edge_on_wsi % 256)
cell_num_x = np.int32(x_edge_on_wsi // 256)
cell_num_y = np.int32(y_edge_on_wsi // 256)
x_on_image_low_resolution = np.int32((x_on_wsi // 8) + 127)
y_on_image_low_resolution = np.int32((y_on_wsi // 8) + 127)
    
ret, frame = cap.read() 
image_fov_1 = frame[x_fov - r_fov : x_fov + r_fov, y_fov - r_fov : y_fov + r_fov]
image_fov_low_resolution = image_fov_1[0::8,0::8,:]
cv2.imshow('field_of_view', image_fov_1); cv2.waitKey(1);
img1 = cv2.imread(f'{cell_num_x}_{cell_num_y}.jpeg')
img2 = cv2.imread(f'{cell_num_x+1}_{cell_num_y}.jpeg')
img3 = cv2.imread(f'{cell_num_x}_{cell_num_y+1}.jpeg')
img4 = cv2.imread(f'{cell_num_x+1}_{cell_num_y+1}.jpeg')
img1[x_edge_on_own_pic:256, y_edge_on_own_pic:256] = image_fov_1[0:256-x_edge_on_own_pic, 0:256-y_edge_on_own_pic]
img2[0:x_edge_on_own_pic, y_edge_on_own_pic:256] = image_fov_1[256-x_edge_on_own_pic:256, 0:256-y_edge_on_own_pic]
img3[x_edge_on_own_pic:256, 0:y_edge_on_own_pic] = image_fov_1[0:256-x_edge_on_own_pic, 256-y_edge_on_own_pic:256]
img4[0:x_edge_on_own_pic, 0:y_edge_on_own_pic] = image_fov_1[256-x_edge_on_own_pic:256, 256-y_edge_on_own_pic:256]
cv2.imwrite(f'{cell_num_x}_{cell_num_y}.jpeg', img1)  
cv2.imwrite(f'{cell_num_x+1}_{cell_num_y}.jpeg', img2)  
cv2.imwrite(f'{cell_num_x}_{cell_num_y+1}.jpeg', img3)  
cv2.imwrite(f'{cell_num_x+1}_{cell_num_y+1}.jpeg', img4)

image_write = image_fov_1.copy()

image_low_resolution[x_on_image_low_resolution - 16 : x_on_image_low_resolution + 16, y_on_image_low_resolution - 16 : y_on_image_low_resolution + 16] = image_fov_low_resolution
cv2.imshow('image_low_resolution', image_low_resolution)
#%% while loop
while True:
#%% wait 1ms for esc to close
    if cv2.waitKey(1) & 0xFF == 27:
        break
    ret, frame = cap.read() 
    image_fov_2 = frame[x_fov - r_fov : x_fov + r_fov, y_fov - r_fov : y_fov + r_fov]
#%% find image_low_resolution    
    image_fov_low_resolution = image_fov_2[0::8,0::8,:]
#%% show 2 windows of views
    cv2.imshow('field_of_view', image_fov_2); cv2.waitKey(1);
    cv2.imshow('image_low_resolution', image_low_resolution); cv2.waitKey(1);
#%% find movement value in each direction
    image_fov_1_laplacian = cv2.Laplacian(image_fov_1, cv2.CV_16S, ksize=3)
    image_fov_2_laplacian = cv2.Laplacian(image_fov_2, cv2.CV_16S, ksize=3)
    #vector_shift_value = register_translation(image_fov_1_laplacian, image_fov_2_laplacian, 8, 'real', True)[0]
    vector_shift_value = registration.phase_cross_correlation(image_fov_1_laplacian, image_fov_2_laplacian)[0]
    Dx1 = (vector_shift_value[0])
    Dy1 = (vector_shift_value[1])
    #print(Dx1, Dy1)
#%% Does we have any movement?
    if Dx1 == 0 and Dy1 == 0:
        bool_move = 0 #no move
        status = 0
    elif Dx1 != 0 and Dy1 == 0:
        bool_move = 1; dir_move = 0 #move on x
        status = 1
    elif Dx1 == 0 and Dy1 != 0:
        bool_move = 1; dir_move = 1 #move on y
        status = 1
    else:
        status = 1
    print(f'is moved?{bool_move}')
#%% calculate position of fov
    x_on_wsi = x_on_wsi + Dx1
    y_on_wsi = y_on_wsi + Dy1
    x_on_image_low_resolution = np.int32((x_on_wsi // 8) + 127)
    y_on_image_low_resolution = np.int32((y_on_wsi // 8) + 127)
    x_edge_on_wsi = np.int32(x_on_wsi - 128)
    y_edge_on_wsi = np.int32(y_on_wsi - 128)
    x_edge_on_own_pic = np.int32(x_edge_on_wsi % 256) #x_point
    y_edge_on_own_pic = np.int32(y_edge_on_wsi % 256) #y_point
    cell_num_x = np.int32(x_edge_on_wsi // 256)
    cell_num_y = np.int32(y_edge_on_wsi // 256)
#%% write image_low_resoultion in it's position
    image_low_resolution[x_on_image_low_resolution - 16 : x_on_image_low_resolution + 16, y_on_image_low_resolution - 16 : y_on_image_low_resolution + 16] = image_fov_low_resolution
#%% read 4 images contacting with fov
    img1 = cv2.imread(f'{cell_num_x}_{cell_num_y}.jpeg')
    img2 = cv2.imread(f'{cell_num_x+1}_{cell_num_y}.jpeg')
    img3 = cv2.imread(f'{cell_num_x}_{cell_num_y+1}.jpeg')
    img4 = cv2.imread(f'{cell_num_x+1}_{cell_num_y+1}.jpeg')
#%% construct window_before (fov position on wsi before writing new image)
    window_before[0:256-x_edge_on_own_pic, 0:256-y_edge_on_own_pic] = np.uint8(img1[x_edge_on_own_pic:256, y_edge_on_own_pic:256])
    window_before[256-x_edge_on_own_pic:256, 0:256-y_edge_on_own_pic] = np.uint8(img2[0:x_edge_on_own_pic, y_edge_on_own_pic:256])
    window_before[0:256-x_edge_on_own_pic, 256-y_edge_on_own_pic:256] = np.uint8(img3[x_edge_on_own_pic:256, 0:y_edge_on_own_pic])
    window_before[256-x_edge_on_own_pic:256, 256-y_edge_on_own_pic:256] = np.uint8(img4[0:x_edge_on_own_pic, 0:y_edge_on_own_pic])
    
    window_before_gray = cv2.cvtColor(window_before, cv2.COLOR_BGR2GRAY)
    cv2.imshow('test', window_before_gray); cv2.waitKey(1);
#%% find how rows will change
    number_rows_change = 0
    number_cols_change = 0
    for i in np.arange(0, 256, 1):
        mask_writed = np.where(window_before_gray>=250, 0, 1)
        a = np.any(mask_writed==0)
        print(a)
        row_window_before_gray = mask_writed[i, :]
        col_window_before_gray = mask_writed[:, i]
        
        row_sum = np.sum(row_window_before_gray)
        col_sum = np.sum(col_window_before_gray)

        if (row_sum < 250):
            number_rows_change = i
        if (col_sum < 250):
            number_cols_change = i
    number_rows_change = 100    
#%% set correction_stat, do we need any correction?
    if Dy1!=0 and Dx1==0:
        correction_stat = 1
    else:
        correction_stat = 0
#%% write if any movement shown: stat
# where will be corrected or no any where: correction_stat
    if status==1:
        if correction_stat == 0:
            image_write = image_fov_2.copy()
        elif correction_stat == 1:
            image_write = window_before.copy()
            if Dy1>0:
                image_write[:, 255-np.uint8(Dy1):256, :] = np.uint8(image_fov_2[:, 255-np.uint8(Dy1):256, :])
            if Dy1<0:
                image_write[:, 0:np.uint8(Dy1), :] = image_fov_2[:, 0:np.uint8(Dy1), :]
            for k in np.arange(0, number_rows_change+1, 1):
                if Dy1>0:
                    image_write[:, 255-np.uint8(Dy1):256, :] = np.uint8(((number_rows_change - k)/number_rows_change) * np.int32(window_before[k, 255-np.uint8(Dy1):256, :])) + np.uint8((k/number_rows_change) * np.int32(image_fov_2[k, 255-np.uint8(Dy1):256, :]))
                if Dy1<0:
                    image_write[:, 0:np.uint8(Dy1), :] = np.uint8(((number_rows_change - k)/number_rows_change) * np.int32(window_before[k, 0:np.uint8(Dy1), :])) + np.uint8((k/number_rows_change) * np.int32(image_fov_2[k, 0:np.uint8(Dy1), :]))

        #cv2.imshow('test', image_write); cv2.waitKey(1);
        #image_write = window_before
        img1[x_edge_on_own_pic:256, y_edge_on_own_pic:256] = image_write[0:256-x_edge_on_own_pic, 0:256-y_edge_on_own_pic]
        img2[0:x_edge_on_own_pic, y_edge_on_own_pic:256] = image_write[256-x_edge_on_own_pic:256, 0:256-y_edge_on_own_pic]
        img3[x_edge_on_own_pic:256, 0:y_edge_on_own_pic] = image_write[0:256-x_edge_on_own_pic, 256-y_edge_on_own_pic:256]
        img4[0:x_edge_on_own_pic, 0:y_edge_on_own_pic] = image_write[256-x_edge_on_own_pic:256, 256-y_edge_on_own_pic:256]
        cv2.imwrite(f'{cell_num_x}_{cell_num_y}.jpeg', img1)  
        cv2.imwrite(f'{cell_num_x+1}_{cell_num_y}.jpeg', img2)  
        cv2.imwrite(f'{cell_num_x}_{cell_num_y+1}.jpeg', img3)  
        cv2.imwrite(f'{cell_num_x+1}_{cell_num_y+1}.jpeg', img4)
    #################################################
    image_fov_1 = image_fov_2.copy()
cv2.destroyAllWindows()