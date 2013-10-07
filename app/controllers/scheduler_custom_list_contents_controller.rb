class SchedulerCustomListContentsController < ApplicationController
  unloadable

  def create
    @scheduler_custom_list_content = SchedulerCustomList.current.scheduler_custom_list_contents
                                                                .build(:name => params[:name])
    if @scheduler_custom_list_content.save
      render :template => "scheduler_custom_list_contents/create",
             :handlers => [:erb],
             :formats => [:js]
    end
  end

  def update
    scheduler_custom_list_content = SchedulerCustomListContent.find(params[:id])
    if scheduler_custom_list_content.update_attributes(:name => params[:name])
      render :json => scheduler_custom_list_content
    end
  end

  def destroy
    @scheduler_custom_list_content = SchedulerCustomListContent.find(params[:id])
    if @scheduler_custom_list_content.destroy
      render :template => "scheduler_custom_list_contents/destroy",
             :handlers => [:erb],
             :formats => [:js]
    end
  end
end
